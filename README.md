# Personal Portfolio Website

This repository contains a personal portfolio website built to present projects, experience, skills, and contact information in a clean single-page format.

The site is designed as a lightweight static portfolio with a strong focus on presentation, structured content, responsive layout, and search visibility.

## What The Website Does

The portfolio introduces the developer, highlights technical skills, shows work experience, and presents selected projects with images, descriptions, and technology tags.

Instead of hardcoding everything directly into the page, project, experience, and certificate content is stored in JSON files. This makes the site easier to update and maintain as new work is added.

## Main Features

- single-page portfolio layout with clear sections for about, skills, experience, projects, and contact
- responsive design for mobile, tablet, and desktop screens
- animated navigation, scroll effects, and UI transitions for a more polished browsing experience
- JSON-driven content for projects, experience, and certificates
- project gallery support with screenshots and technology labels
- social and contact links for professional outreach
- SEO-focused metadata, structured data, sitemap, and robots.txt
- PWA manifest support for a more app-like installation experience

## How The Site Works

The website is built as a static front-end project.

`index.html` defines the page structure and SEO metadata.

`css/style.css` and `css/style.min.css` handle the visual design, responsive layout, and animation styling.

`js/script.js` manages interactive behavior such as:

- mobile navigation toggling
- smooth scrolling between sections
- active navigation highlighting
- scroll-based navbar updates
- animated counters and timed UI effects
- keyboard interaction support

The data files under `data/` separate content from layout logic:

- `projects.json` stores portfolio project details
- `experience.json` stores work experience entries
- `certificates.json` stores certification data

This structure makes the portfolio easier to expand without rewriting the whole page.

## Content Structure

### `assets/`

Stores the core visual assets used across the site, including the logo, profile image, and SVG skill icons.

### `project_images/`

Contains screenshots used in the project showcase section.

### `data/`

Contains structured JSON content for projects, work experience, and certificates.

### `css/`

Contains the main styling files for the site.

### `js/`

Contains the JavaScript used for navigation, animation, and front-end interactions.

## What The Project Solves

This project solves a common problem with personal portfolio sites: they often become hard to update as more projects and experience are added.

By separating structured content into JSON files and keeping the front end lightweight, this portfolio makes it easier to:

- update project listings without large HTML rewrites
- keep experience and certificate data organized
- present technical work in a recruiter-friendly format
- maintain strong SEO and discoverability for personal branding

## Technology Overview

- HTML5
- CSS3
- JavaScript
- JSON-based content files
- Font Awesome
- PWA manifest
- SEO metadata and structured data

## Repository Structure

```text
portfolio-minkonaing/
├── index.html
├── css/
├── js/
├── data/
├── assets/
├── project_images/
├── manifest.json
├── robots.txt
├── sitemap.xml
└── README.md
```

## Summary

This repository contains a static portfolio website built to showcase development work in a clear and maintainable way. It combines structured content, responsive design, interactive front-end behavior, and SEO improvements to create a professional developer portfolio.
