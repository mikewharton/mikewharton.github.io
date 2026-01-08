---
title: "Data-driven Sim-to-Real Transfer"
date: 2023-06-20
layout: layouts/posts.njk
permalink: /research/sim-to-real-transfer.html
keywords: ["sim-to-real", "robotics", "machine learning", "transfer learning"]
description: "Bridging the simulation-to-reality gap using data-driven domain adaptation techniques for robotic manipulation tasks."
image: "sim-to-real.svg"
kicker: "Paper · Sim-to-real"
year: "2023"
status: "preprint"
---

## Summary

This work addresses the fundamental challenge of transferring policies trained in simulation to real-world robotic systems. We propose a data-driven approach that uses domain adaptation to minimize the sim-to-real gap.

## Approach

Our method leverages adversarial training to learn domain-invariant features that generalize across simulation and reality. The key innovation is a progressive adaptation strategy that gradually shifts from simulated to real-world data.

## Results

- **Success Rate**: 87% task completion in real-world scenarios (vs 45% baseline)
- **Sample Efficiency**: 3x reduction in real-world data requirements
- **Generalization**: Works across multiple robot platforms and task domains

## Resources

- [Paper (PDF)](#)
- [Code Repository](#)
- [Supplementary Material](#)
