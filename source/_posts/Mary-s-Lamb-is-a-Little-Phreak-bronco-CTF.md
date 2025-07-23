---
title: Mary's Lamb is a Little Phreak:bronco CTF
tags: ctf bronco ctftime
---
  


In this post, I will describe how I solved **Mary's Lamb is a Little Phreak**, a web challenge from **Bronco CTF** conducted on 16/02/2025.

## Challenge Description  

**Title:** Mary's Lamb is a Little Phreak  
**Points:** 370  
**Author:** danny  

> ***I have this friend Mary who has a lamb that only responds to a specific dial tone. Can you help Mary find her lamb?***

A website was provided: [Mary's Dialpad](https://mary.web.broncoctf.xyz)  

### Exploring the Challenge  

The website presented a **telephone dial pad** where pressing a button generated a **DTMF tone** (Dual-Tone Multi-Frequency). However, there was another challenge i had to face which was the dialed number will reset after 3s. 
<img src="/images/marydial.png">

**So basically we need to enter the number within in 3s**

I thought about using burpsuite then to intercept request and wants to know how the request was forwarded to the server and response back from the server.


#### Observing Requests in Burp Suite  

I analyzed the **requests and responses** using **Burp Suite** and found that the entered numbers were being **sent via the URL** in this format:

<img src="/images/burp1.png">


In the header section u can see the entered dialtone

### GET /mary/22580 HTTP/

### How i got the dialtome 

**I googled the mary lamp song , then i saw many pages dial pad tones heading, i didnt know we can make the tune of the song using dialpad of the mobiles.**

**Then i got this page**

### https://www.wikihow.com/Play-%27Mary-Had-a-Little-Lamb%27-on-a-Phone

<img src="/images/marylamp.png">

I modified the requests entered theses codes via the repeater tab and checked the reponse. But every response was invalid

**then i found this page**
### https://www.reddit.com/r/FuckImOld/comments/qmm5ho/did_anyone_else_play_mary_had_a_little_lamb_while/
Got this code **32123332223993212333322321** from reddit, which i entered into request header and got the flag in the response page.

<img src="/images/marylampflag.png">


### FLAG:   bronco{W0ah_y0u_f0und_m4rys_1itt1e_1amb}








