---
title: "Robotic arm for drawing shapes"
layout: layouts/posts.njk
status: "Completed"
description: "Arduino-controlled bi-articulated robot arm using low-cost DC motors."
keywords: ["project", "robotics", "control", "arduino"]
date: 2023-12
permalink: "/research/robot-arm/"
feature_image: "11a.jpg"
---

Given cheap DC motors instead of conventional stepper motors, the challenge in this project was designing an Arduino control system capable of extracting some performance from less than ideal hardware.

Physical and controller optimisations were made to an existing example model of an Arduino controlled bi-articulated robot arm over approximately two months.

MATLAB sensitivity analysis was carried out, finding that the best sensitivity occurred with the shortest equal length arms possible. Physical sensitivity testing was also carried out by drawing a large grid and assessing accuracy.

Controller design was derived using classical mechanics and Simulink. An Output Feedback Controller was created but abandoned due to time constraints. The final controller used derived PID gains with controller deadzone, filtering, and anti-windup, alongside reference signal adaptations. This produced the required shapes in 10–20 seconds with a maximum deviation of roughly 2%.
