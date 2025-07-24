---
title: About
layout: page
---

<style>
.about-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1rem;
  font-family: 'Geist Variable', 'Segoe UI', Arial, sans-serif;
}
.profile-card {
  display: flex;
  align-items: center;
  background: linear-gradient(120deg, #f7fafc 60%, #e0e7ff 100%);
  border-radius: 18px;
  box-shadow: 0 6px 24px 0 #b6b6b633, 0 0 0 1px #e0e7ff;
  padding: 2rem 2.5rem;
  margin-bottom: 2.5rem;
  animation: fade-in-down 1s;
}
.profile-avatar {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #6366f1;
  margin-right: 2rem;
  box-shadow: 0 2px 12px #6366f133;
}
.profile-info h1 {
  margin: 0 0 0.5rem 0;
  font-size: 2.2rem;
  font-weight: 700;
  color: #3730a3;
  letter-spacing: 1px;
  animation: fade-in-down 1.2s;
}
.profile-info .subtitle {
  font-size: 1.1rem;
  color: #6366f1;
  margin-bottom: 0.7rem;
}
.profile-links a {
  display: inline-block;
  margin-right: 1.2rem;
  color: #6366f1;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s;
}
.profile-links a:hover {
  color: #3730a3;
}
.animated-section {
  font-size: 1.5rem;
  font-weight: 600;
  margin-top: 2.5rem;
  margin-bottom: 1.2rem;
  color: #3730a3;
  position: relative;
  display: inline-block;
  animation: fade-in-down 1.1s;
}
.animated-section::after {
  content: '';
  display: block;
  width: 60%;
  height: 3px;
  background: linear-gradient(90deg, #6366f1 60%, #a5b4fc 100%);
  border-radius: 2px;
  margin-top: 6px;
  animation: grow-bar 1.2s;
}
@keyframes fade-in-down {
  0% { opacity: 0; transform: translateY(-40px); }
  100% { opacity: 1; transform: translateY(0); }
}
@keyframes grow-bar {
  0% { width: 0; }
  100% { width: 60%; }
}
.badge {
  display: inline-block;
  background: #6366f1;
  color: #fff;
  border-radius: 8px;
  padding: 4px 12px;
  margin: 2px 6px 2px 0;
  font-size: 0.98em;
  font-weight: 500;
  box-shadow: 0 1px 4px #6366f133;
  transition: background 0.2s;
}
.badge i {
  margin-right: 4px;
}
.timeline {
  border-left: 3px solid #6366f1;
  margin-left: 1.2rem;
  padding-left: 1.5rem;
  margin-bottom: 2rem;
}
.timeline-item {
  margin-bottom: 1.5rem;
  position: relative;
  animation: fade-in-down 1.2s;
}
.timeline-item::before {
  content: '';
  position: absolute;
  left: -1.6rem;
  top: 0.3rem;
  width: 14px;
  height: 14px;
  background: #6366f1;
  border-radius: 50%;
  box-shadow: 0 0 0 4px #e0e7ff;
}
</style>

<div class="about-container">
  <div class="profile-card">
    <img class="profile-avatar" src="/images/myself.jpg" alt="Abel Jorlin Avatar">
    <div class="profile-info">
      <h1>Abel Jorlin</h1>
      <div class="subtitle">Cybersecurity Enthusiast & Full Stack Developer</div>
      <div class="profile-links">
        <a href="mailto:abelselfi12@gmail.com"><i class="fa-solid fa-envelope"></i> Email</a>
        <a href="https://linkedin.com/in/abel-jorlin-812981230" target="_blank"><i class="fa-brands fa-linkedin"></i> LinkedIn</a>
        <a href="https://github.com/selfi123" target="_blank"><i class="fa-brands fa-github"></i> GitHub</a>
        <span style="color:#6366f1;font-weight:500;">Kochi, Kerala, India</span>
      </div>
    </div>
  </div>

  <div class="animated-section">Professional Summary</div>
  <p>Highly motivated cybersecurity enthusiast with hands-on experience in penetration testing, vulnerability assessment, ethical hacking, and secure application development. Skilled in Python, Flask, Flutter, and industry tools like Nmap, Burp Suite, Wireshark, and CVE exploitation. Passionate about safeguarding digital infrastructure and continuously improving existing systems. Proven leadership as Cybersecurity Club Lead and CTF winner.</p>

  <div class="animated-section">Technical Skills</div>
  <div>
    <span class="badge"><i class="fa-brands fa-python"></i> Python</span>
    <span class="badge"><i class="fa-brands fa-js"></i> JavaScript</span>
    <span class="badge"><i class="fa-brands fa-flask"></i> Flask</span>
    <span class="badge"><i class="fa-brands fa-react"></i> React</span>
    <span class="badge"><i class="fa-brands fa-linux"></i> Linux</span>
    <span class="badge"><i class="fa-brands fa-docker"></i> Docker</span>
    <span class="badge"><i class="fa-brands fa-git-alt"></i> Git</span>
    <span class="badge"><i class="fa-brands fa-aws"></i> AWS</span>
    <span class="badge"><i class="fa-solid fa-database"></i> MySQL</span>
    <span class="badge"><i class="fa-brands fa-html5"></i> HTML</span>
    <span class="badge"><i class="fa-brands fa-css3-alt"></i> CSS</span>
    <span class="badge"><i class="fa-brands fa-java"></i> Java</span>
    <span class="badge"><i class="fa-brands fa-php"></i> PHP</span>
    <span class="badge"><i class="fa-brands fa-cuttlefish"></i> C/C++</span>
    <span class="badge"><i class="fa-brands fa-hackerrank"></i> CTFs</span>
  </div>

  <div class="animated-section">Education</div>
  <div class="timeline">
    <div class="timeline-item">
      <strong>Integrated BCA-MCA (Minor in Mathematics Core)</strong><br>
      Amrita Vishwa Vidyapeetham, Kochi, 2021 – 2026<br>
      CGPA: 8.5
    </div>
    <div class="timeline-item">
      <strong>Higher Secondary (Computer Science)</strong><br>
      M.A.M.H.S.S, Koratty, 2019 – 2021<br>
      Percentage: 97%
    </div>
    <div class="timeline-item">
      <strong>SSLC</strong><br>
      St. Thomas H.S.S, Ayroor, 2018 – 2019<br>
      Percentage: 98%
    </div>
  </div>

  <div class="animated-section">Experience & Projects</div>
  <div class="timeline">
    <div class="timeline-item">
      <strong>Cybersecurity Intern</strong> @ Prodigy Infotech — 1 Month<br>
      Built tools like Caesar Cipher, image encryption, keylogger, and password strength checker. Gained exposure to encryption, code logic and network packet flow analysis.
    </div>
    <div class="timeline-item">
      <strong>Python Developer Intern</strong> @ Infosys SpringBoard — 1 Month<br>
      Developed Python projects: Voice Assistant, Weather App, Chat App. Used Flask, JavaScript, HTML, ensuring user-friendly interfaces.
    </div>
    <div class="timeline-item">
      <strong>Android Development Intern</strong> @ Prodigy Infotech — 1 Month<br>
      Built Flutter apps: To-Do list, QR Scanner, Calculator, Stopwatch. Implemented real-time scanning and stateful navigation.
    </div>
    <div class="timeline-item">
      <strong>Vulnerability Scanning Web Application</strong><br>
      Automated web vulnerability scanning using Nmap and CVE databases. <span class="badge">Python</span> <span class="badge">Flask</span>
    </div>
    <div class="timeline-item">
      <strong>Network Devices Identification System</strong><br>
      Detects and classifies devices in the network via Python-Nmap module. <span class="badge">Python</span>
    </div>
    <div class="timeline-item">
      <strong>Hospital Staff & Mobility Aid Monitoring System</strong><br>
      Real-time tracking of staff and assistive devices. <span class="badge">Flutter</span> <span class="badge">Firebase</span>
    </div>
    <div class="timeline-item">
      <strong>File Transferring Web Application</strong><br>
      Secure file transfer tool with hash-based integrity verification. <span class="badge">Python</span> <span class="badge">MySQL</span>
    </div>
    <div class="timeline-item">
      <strong>Lite Web Browser</strong><br>
      Built a lightweight, fast web browser with essential browsing tools. <span class="badge">HTML</span> <span class="badge">CSS</span> <span class="badge">JavaScript</span>
    </div>
  </div>

  <div class="animated-section">Certifications</div>
  <ul>
    <li>Ethical Hacking – MyCaptain</li>
    <li>Python Programming – MyCaptain / Infosys SpringBoard</li>
    <li>Flutter Development – Coursera</li>
    <li>Introduction to Cybersecurity – Cisco</li>
    <li>Fundamentals of Cryptography – Infosys SpringBoard</li>
    <li>Fundamentals of Information Security – Infosys SpringBoard</li>
    <li>Introduction to AI – Cisco</li>
    <li>Business Communication – MyCaptain</li>
    <li>Problem Solving (Intermediate) – HackerRank</li>
  </ul>

  <div class="animated-section">Languages</div>
  <div>
    <span class="badge">English — Fluent</span>
    <span class="badge">Malayalam — Native</span>
    <span class="badge">Hindi — Conversational</span>
  </div>

  <div class="animated-section">Interests</div>
  <div>
    <span class="badge">Cybersecurity CTFs</span>
    <span class="badge">Bug Bounty Hunting</span>
    <span class="badge">Gaming</span>
    <span class="badge">Building Tech Tools</span>
  </div>
</div> 