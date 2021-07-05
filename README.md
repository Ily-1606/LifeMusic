
# Lifemusic

A library for player music.



## Why using it?

This project is including:
- Visualizer
- Logo
- Title
- Artics
- Keyboard shortcuts
- Reactions list
- Reaction badge
- Chapter
- Modify speed, loop, muted, subtitle. And cofig will auto save to LocalStorage if you config it mode "auto"
## Installation 

Install my-project with git

```bash 
  git clone https://github.com/Ily-1606/LifeMusic.git
  cd ./LifeMusic
```
    
## Usage

Add js/lifemusic.js

Add css/lifemusic.css

In your html

```
const music = new LifeMusic("music", config,dom);
```
With:
- "music" is element id will inner code.
- "config" is object config, it's below.
- "dom" is adapter will inner dom.

Example in index.html, and desktop-mode.html.

Add event in music, you can

```
    audio = music.audio; //audio is property of class music.
```


