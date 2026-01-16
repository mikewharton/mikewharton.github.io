---
title: "Mean Intensity Mapping"
kicker: "Journal Paper"
layout: layouts/posts.njk
status: "Completed"
description: "An idea from my individual undergraduate research project which led to a journal publication."
keywords: ["research", "structural health monitoring", "computer vision", "signal processing", "dynamics", "low-cost sensors"]
date: 2023-05
permalink: "/research/mean-intensity-mapping/"
featured: true
feature_image: "101a.jpg"
---

My research project focused on the use of photogrammetry (extracting useful data from cameras) for low-cost Structural Health Monitoring (SHM). While recording elastic structures and looking for ways of tracking objects I ended up coming up with an incredibly simple but effective way of extracting frequency information from video using brightness, and was surprised seemingly no one had done it before. The method, which I called Mean Intensity Mapping (MIM), calculated the average brightness or intensity of a video region every frame, and performed a Fast Fourier Transform (FFT) to extract frequencies.

I ended up testing it on all sorts of dynamic structures including a hamster wheel, washing machine, and the Clifton Suspension Bridge. I bought a cheap high-optical-zoom Panasonic video camera and borrowed a tripod, which allowed me to zoom in on the bridge to catch it oscillating, to characterise the frequency resposnse. I found MIM to be reasonably comparable in terms of accuracy to more advanced methods of object tracking such as the KLT algorithm, provided the conditions were consistent.

This project left a few more questions in terms of how this process could further be optimised, I theorised that since most cheap webcams already include some kind of brightness compensation, this data is already being measured either in hardware or software. From this it would be possible to make these sensors extremely cheaply. I am quite interested in how you can extract meaningful data from cheap equipment, and have also continued looking at this with my other projects using acoustic emission with cheap lapel microphones. I wasn't necessarily as interested in SHM but it was a good facet for exploring this.

I also made a piece of software which could perform MIM in real time using a computer webcam, there is a video of me demonstrating this in the supplimentary materials of the  
[MSSP publication](https://doi.org/10.1016/j.ymssp.2024.111583).