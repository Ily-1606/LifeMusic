class LifeMusic {
    sources = undefined
    muted = false;
    playing = false;
    volume = 1;
    element_id = undefined
    autoplay = false
    thumbnail_img = false
    loop = false;
    subtitle = false;
    visualizer = 1;
    player_id = `lifemusic_${new Date().getTime()}`
    constructor(element_id, data, setDom) {
        for (let i in data) {
            this[i] = data[i]
        }
        window[this.player_id] = {}
        this.element_id = element_id
        var t = this;
        var dom = document.getElementById(element_id)
        if (setDom) {
            setDom.setPlayerID(this.player_id);
            setDom.setConfig(data);
            var dom_create = setDom;
        }
        else {
            var dom_create = new DOM(this.player_id, data);
        }
        let inner_dom = dom_create.createPlayer();
        if (this.tracks) {
            let script = document.createElement("script");
            script.src = "/js/vtt.min.js";
            script.async = true;
            script.onload = function () {
                dom.innerHTML = inner_dom
                t.ready();
            };
            document.head.appendChild(script);
        }
        else {
            dom.innerHTML = inner_dom
            t.ready()
        }
    };
    ready() {
        if (this.controller) {
            if (this.controller.animation) {
                this.hidden()
                this.active()
            }
        }
        else {
            this.hidden()
            this.active()
        }
        if (this.muted == "auto") {
            if (this.getFromStorage("muted") == "true")
                this.muted = true
            else
                this.muted = false
        }
        if (this.subtitle == "auto") {
            if (this.getFromStorage("subtitle") == "true")
                this.subtitle = true
            else
                this.subtitle = false
        }
        if (this.loop == "auto") {
            if (this.getFromStorage("loop") == "true")
                this.loop = true
            else
                this.loop = false
        } if (this.speed == "auto") {
            if (this.getFromStorage("speed"))
                this.speed = parseFloat(this.getFromStorage("speed"))
            else
                this.speed = 1;
        }
        this.attachEventForAudio();
        this.eventSubTitle();
        this.renderSetttingListSubtitle();
        if (this.subtitle)
            this.runSubtitle();
        this.renderSetttingListQuality();
        this.eventSpeed();
        this.eventVisualizer();
        this.eventClickItemReaction()
        this.onDomReady()
    }
    findElement(query) {
        var player = document.getElementById(this.player_id);
        return player.querySelector(query);
    }
    onDomReady() {
        //console.log("Dom is ready!");
    }
    hidden() {
        var t = this;
        if (!window[t.player_id].hidden) {
            window[t.player_id].hidden = setTimeout(function () {
                var dom = document.getElementById(t.player_id).querySelector(".controller_inner");
                if (!dom.classList.contains("anm_hidden"))
                    dom.classList.add("anm_hidden")
            }, 3000)
        }
    };
    eventSubTitle() {
        var t = this;
        var player = document.getElementById(t.player_id),
            btn_subtitles = player.querySelector(".btn_subtitles");
        btn_subtitles.addEventListener("click", function () {
            t.subtitle = !t.subtitle;
            t.toogleSubtitle()
        })
    }
    eventSpeed() {
        var player = document.getElementById(this.player_id),
            speed_setting = player.querySelector(".speed_setting>.inner_item"),
            t = this;
        player.querySelector(".text_speed").textContent = (t.speed === 1 ? "Chuẩn" : `x${this.speed}`);
        speed_setting.addEventListener("click", function (ev) {
            for (let i = 0; i < ev.path.length; i++) {
                if (ev.path[i].classList.contains("item_tooltip")) {
                    let value = ev.path[i].getAttribute("for_value");
                    t.changeSpeed(value)
                    ev.path[i].querySelector(".content_tooltip").classList.add("tick")
                    break
                }
            }
        })
    }
    eventClickItemReaction() {
        var player = document.getElementById(this.player_id),
            t = this,
            inner_more_info = player.querySelector(".inner_more_info");
        inner_more_info.addEventListener("click", function (ev) {
            for (var reaction_item of ev.path) {
                if (reaction_item.classList.contains("reaction_item")) {
                    var value = parseInt(reaction_item.getAttribute("for_value"))
                    var onClick = t.reactions["list"][value].onClick;
                    if (onClick) {
                        onClick(reaction_item)
                    }
                    break;
                }
            }
        })
    }
    eventVisualizer() {
        var player = document.getElementById(this.player_id),
            visualizer_setting = player.querySelector(".visualizer_setting>.inner_item"),
            t = this;
        visualizer_setting.addEventListener("click", function (ev) {
            for (let i = 0; i < ev.path.length; i++) {
                if (ev.path[i].classList.contains("item_tooltip")) {
                    let value = ev.path[i].getAttribute("for_value");
                    t.changeVisualzer(value)
                    ev.path[i].querySelector(".content_tooltip").classList.add("tick")
                    break
                }
            }
        })
    }
    toogleSubtitle() {
        var player = document.getElementById(this.player_id),
            btn_subtitles = player.querySelector(".btn_subtitles"),
            text = "",
            track_text = player.querySelector(".track_text");
        this.renderSettingSubtitle()
        this.onChangeSettingSubtile()
        this.setFromStorage("subtitle", this.subtitle)
        if (this.subtitle)
            btn_subtitles.classList.add("active")
        else
            btn_subtitles.classList.remove("active"), track_text.textContent = text, track_text.style.display = "none"
    }
    onChangeSettingSubtile() {
        var player = document.getElementById(this.player_id),
            subtitle_setting = player.querySelector(".subtitle_setting"),
            subtitle_setting_item = subtitle_setting.querySelectorAll(".item_tooltip");
        for (let node of subtitle_setting_item) {
            node.querySelector(".content_tooltip").classList.remove("tick")
            if (node.getAttribute("for_value") == "-1" && !this.subtitle) {
                node.querySelector(".content_tooltip").classList.add("tick")
            }
            if (node.getAttribute("for_value") == window[this.player_id].subtitle_running && this.subtitle) {
                node.querySelector(".content_tooltip").classList.add("tick")
            }
        }
    }
    active() {
        var player = document.getElementById(this.player_id);
        var t = this;
        player.addEventListener("mouseenter", function () {
            if (window[t.player_id].hidden) {
                clearTimeout(window[t.player_id].hidden)
                window[t.player_id].hidden = 0
            }
            let dom = player.querySelector(".controller_inner")
            if (dom.classList.contains("anm_hidden"))
                dom.classList.remove("anm_hidden")
        });
        player.addEventListener("mouseleave", function () {
            t.hidden()
        })
    };
    converTime(time) {
        return `${time / 60 >= 10 ? Math.floor(time / 60) : "0" + Math.floor(time / 60)}:${time % 60 >= 10 ? Math.floor(time % 60) : "0" + Math.floor(time % 60)}`
    }
    attachEventForAudio() {
        var t = this,
            player = document.getElementById(this.player_id),
            audio = t.audio = player.querySelector("audio"),
            current_bar = player.querySelector(".current_progress"),
            text_current_time = player.querySelector(".time_current"),
            text_duration = player.querySelector(".time_total"),
            time_progress_bar = player.querySelector(".time_progress_bar"),
            text_time = player.querySelector(".text_time"),
            btn_volume = player.querySelector(".btn_volume"),
            group_volume = player.querySelector(".group_volume"),
            volume_bar = player.querySelector(".volume_bar"),
            progress_volume = player.querySelector(".progress_volume"),
            btn_player = player.querySelector(".btn_player"),
            btn_loop = player.querySelector(".btn_loop"),
            toast_info = player.querySelector(".toast_info"),
            text_toast = player.querySelector(".text_toast"),
            image_toast = player.querySelector(".image_toast"),
            time_current_svg_attach = player.querySelector(".time_current_svg_attach"),
            text_chapter = player.querySelector(".text_chapter"),
            lifemusic_logo = player.querySelector(".lifemusic_logo"),
            lifemusic_titleGroup = player.querySelector(".lifemusic_titleGroup"),
            btn_subtitles = player.querySelector(".btn_subtitles"),
            chapter_group = player.querySelector(".chapter_group"),
            btn_setting = player.querySelector(".btn_setting");
        audio.addEventListener("canplay", function () {
            if (this.autoplay)
                t.playAudio(audio)
            let time = Math.floor(audio.duration)
            text_duration.textContent = t.converTime(time)
            if (!window[t.player_id].interval_buffered)
                t.updateBuffered()
        })
        progress_volume.style.width = `${t.volume * 100}%`, audio.volume = t.volume //init
        if (t.loop) {
            btn_loop.classList.add("active")
        }
        audio.loop = t.loop //init
        if (t.speed == undefined)
            t.speed = audio.playbackRate;
        this.changeSpeed(t.speed)
        audio.addEventListener("timeupdate", function () {
            current_bar.style.width = `${(audio.currentTime / audio.duration) * 100}%`
            let time = Math.floor(audio.currentTime)
            text_current_time.textContent = t.converTime(time)
            time_current_svg_attach.setAttribute("style", `stroke-dasharray: ${Math.round(time / audio.duration * 110)},110`)
            t.loadChapter(time)
        });
        if (this.logo) {
            if (this.logo.onClick) {
                lifemusic_logo.addEventListener("click", function () {
                    t.logo.onClick(this);
                });
            }
        }
        if (this.titlegroup) {
            if (this.titlegroup.onClick) {
                lifemusic_titleGroup.addEventListener("click", function () {
                    t.titlegroup.onClick(this);
                });
            }
        }
        if (this.subtitle)
            btn_subtitles.classList.add("active")
        if (this.chapters) {
            if (this.chapters.onClick) {
                chapter_group.addEventListener("click", function () {
                    t.chapters.onClick(this, t.current_chapter);
                });
            }
        }
        this.current_chapter = -1;
        t.loadChapter(0)
        audio.addEventListener("ended", function () {
            clearInterval(window[t.player_id].interval_buffered)
            audio.pause()
        })
        audio.addEventListener("volumechange", function () {
            progress_volume.style.width = `${audio.volume * 100}%`
        })
        audio.addEventListener("play", function () {
            t.playing = true,
                btn_player.classList.remove("btn_pausing"),
                btn_player.classList.add("btn_playing")
            var thumbnail = player.querySelector(".thumbnail");
            thumbnail.classList.add("playing")
        });
        audio.addEventListener("pause", function () {
            t.playing = false,
                btn_player.classList.remove("btn_playing"),
                btn_player.classList.add("btn_pausing");
            var thumbnail = player.querySelector(".thumbnail");
            thumbnail.classList.remove("playing");
        })
        btn_player.addEventListener("click", function () {
            if (t.playing)
                audio.pause()
            else
                audio.play()
        });
        if (this.muted)
            btn_volume.classList.add("btn_muted"), audio.muted = this.muted;
        btn_volume.addEventListener("click", function () {
            audio.muted = t.muted = !t.muted;
            t.setFromStorage("muted", audio.muted)
            if (audio.muted)
                this.classList.add("btn_muted")
            else
                this.classList.remove("btn_muted")
        })
        time_progress_bar.addEventListener("click", function (ev) {
            audio.currentTime = ev.offsetX * audio.duration / this.offsetWidth
        });
        group_volume.addEventListener("mouseenter", function () {
            player.querySelector(".volume_bar").style.width = "60px"
        })
        group_volume.addEventListener("mouseleave", function () {
            player.querySelector(".volume_bar").style.width = "0px"
        })
        volume_bar.addEventListener("click", function (ev) {
            let volume = ev.offsetX / this.offsetWidth
            audio.volume = t.volume = volume
        })
        time_progress_bar.addEventListener("mousemove", function (ev) {
            let time = Math.floor(ev.offsetX * audio.duration / this.offsetWidth)
            text_time.textContent = t.converTime(time)
            text_time.style.left = `${ev.offsetX}px`
        })
        time_progress_bar.addEventListener("mouseleave", function () {
            text_time.textContent = '';
        })
        btn_loop.addEventListener("click", function () {
            audio.loop = t.loop = !t.loop;
            t.setFromStorage("loop", t.loop)
            if (t.loop) {
                this.classList.add("active")
            } else {
                this.classList.remove("active")
            }
        })
        var showSetting = false;
        btn_setting.addEventListener("click", function () {
            let nextEl = this.nextElementSibling
            showSetting = !showSetting;
            if (showSetting)
                nextEl.style.display = "block", this.classList.add("active");
            else
                nextEl.style.display = "none", this.classList.remove("active");
        });
        let content_modal = player.querySelector(".content_modal")
        for (let el of player.querySelectorAll(".main_setting .item_tooltip")) {
            el.addEventListener("click", function () {
                var target = player.querySelector(`.${this.getAttribute("for")}`);
                target.style.display = "block";
                content_modal.classList.add("translate_100")
                let elTarget = player.querySelector(`.${this.getAttribute("for")}>.header_tooltip`)
                elTarget.addEventListener("click", function () {
                    target.style.removeProperty("display")
                    content_modal.classList.remove("translate_100")
                })
            })
        }
        var toast = {
            classList: ["toast_volume", "toast_undo", "toast_redo"],
            clearToast: function (classe) {
                window[t.player_id].toast_info_timmer = undefined;
                for (let i = 0; i < this.classList.length; i++) {
                    if (this.classList[i] == classe)
                        continue
                    image_toast.classList.remove(this.classList[i])
                }
            },
            createToast: function (classe, text) {
                toast_info.style.opacity = "1"
                image_toast.style.removeProperty("background-color")
                image_toast.classList.add(classe)
                text_toast.textContent = text;
                let tt = this
                if (window[t.player_id].toast_info_timmer) {
                    clearInterval(window[t.player_id].toast_info_timmer);
                    tt.clearToast(classe)
                }
                window[t.player_id].toast_info_timmer = setTimeout(function () {
                    toast_info.style.opacity = "0";
                    image_toast.style.backgroundColor = 'transparent'
                    tt.clearToast(null)
                    text_toast.textContent = ""
                }, 1000);
            }
        }
        if (this.hotkey) {
            if (this.hotkey.list && this.hotkey.target) {
                let togglePlay = 32, seekNext = 39, seekNextTime = 10, seekPrev = 37, seekPrevTime = 10, volumeUp = 38, volumeUpValue = 0.1, volumeDown = 40, volumeDownValue = 0.1;
                if (this.hotkey.list.togglePlay) {
                    togglePlay = this.hotkey.list.togglePlay.keyCode;
                }
                if (this.hotkey.list.seekNext) {
                    seekNext = this.hotkey.list.seekNext.keyCode,
                        seekNextTime = this.hotkey.list.seekNext.time;
                }
                if (this.hotkey.list.seekPrev) {
                    seekPrev = this.hotkey.list.seekPrev.keyCode,
                        seekPrevTime = this.hotkey.list.seekPrev.time;
                }
                if (this.hotkey.list.volumeUp) {
                    volumeUp = this.hotkey.list.volumeUp.keyCode,
                        volumeUpValue = this.hotkey.list.volumeUp.value;
                }
                if (this.hotkey.list.volumeDown) {
                    volumeDown = this.hotkey.list.volumeDown.keyCode,
                        volumeDownValue = this.hotkey.list.volumeDown.value;
                }
                if (this.hotkey.target == "player") {
                    this.hotkey.target = player
                }
                if (this.hotkey.target.setAttribute)
                    this.hotkey.target.setAttribute("tabindex", 0)
                this.hotkey.target.addEventListener("keyup", function (ev) {
                    let event;
                    if (ev.keyCode == togglePlay) {
                        if (t.playing)
                            audio.pause()
                        else
                            audio.play()
                        event = "togglePlay";
                    }
                    else if (ev.keyCode == seekNext) {
                        if (audio.currentTime + seekNextTime > audio.duration)
                            audio.currentTime = audio.duration
                        else
                            audio.currentTime += seekNextTime
                        toast.createToast("toast_redo", `+${seekNextTime}s`)
                        event = "seekNext";
                    }
                    else if (ev.keyCode == seekPrev) {
                        if (audio.currentTime - seekPrevTime < 0)
                            audio.currentTime = 0;
                        else
                            audio.currentTime -= seekPrevTime
                        toast.createToast("toast_undo", `-${seekPrevTime}s`)
                        event = "seekPrev";
                    }
                    else if (ev.keyCode == volumeUp) {
                        if (audio.volume + volumeUpValue > 1)
                            audio.volume = 1;
                        else
                            audio.volume += volumeUpValue
                        toast.createToast("toast_volume", `${Math.floor(audio.volume * 100)}%`)
                        event = "volumeUp";
                    }
                    else if (ev.keyCode == volumeDown) {
                        if (audio.volume - volumeDownValue < 0)
                            audio.volume = 0;
                        else
                            audio.volume -= volumeDownValue
                        toast.createToast("toast_volume", `${Math.floor(audio.volume * 100)}%`)
                        event = "volumeDown";
                    }
                    if (t.hotkey.onEvent) {
                        t.hotkey.onEvent(event)
                    }
                })
            }
        }


        //add visualizer
        t.visualizerClass = new Visualizer("visualizer_circle", audio, {})
        t.visualizerClass.start();
        //add reaction
        if (this.reactions) {
            if (this.reactions.reactionAdapter) {
                const reactionAdapter = this.reactions.reactionAdapter,
                    display_info = player.querySelector(".display_info");
                var canvas = document.createElement("canvas");
                canvas.width = display_info.offsetWidth;
                canvas.height = display_info.offsetHeight;
                canvas.setAttribute("id", "reaction_adapter")
                display_info.appendChild(canvas);
                reactionAdapter.run(canvas, audio)
            }
        }
    }
    loadChapter(time, updateAudio) {
        if (this.chapters) {
            let player = document.getElementById(this.player_id),
                text_chapter = player.querySelector(".text_chapter");
            let current_chapter = -1;
            this.chapters.list.forEach(function (item) {
                if (item.timeStart <= time) {
                    current_chapter++;
                }
                else
                    return false;
            })
            if (this.current_chapter != current_chapter) {
                if (updateAudio) {
                    t.audio.currentTime = time;
                }
                this.current_chapter = current_chapter;
                text_chapter.textContent = this.chapters.list[current_chapter].text;
                if (this.chapters.onUpdate) {
                    this.chapters.onUpdate(this.current_chapter)
                }
            }
        }
    }
    setChapter(index) {
        let time = this.chapters.list[index].timeStart;
        this.loadChapter(time, true);
    }
    getFromStorage(key) {
        let storage = window.localStorage;
        return storage.getItem(`lifemusic_${key}`);
    }
    setFromStorage(key, value) {
        let storage = window.localStorage;
        storage.setItem(`lifemusic_${key}`, value)
    }
    updateBuffered() {
        var t = this;
        var player = document.getElementById(this.player_id);
        var progress_healthy = player.querySelector(".healthy_bar")
        window[t.player_id].interval_buffered = setInterval(function () {
            if (t.audio.buffered.length) {
                progress_healthy.style.width = `${t.audio.buffered.end(0) / t.audio.duration * 100}%`
                if (t.audio.buffered.end(0) == t.audio.duration) {
                    clearInterval(window[t.player_id].interval_buffered)
                }
            }
        }, 3000)
    }
    runSubtitle() {
        var player = document.getElementById(this.player_id),
            t = this;
        if (!window[t.player_id].subtitle_source) {
            var running = window[t.player_id].subtitle_running = 0;
            window[t.player_id].subtitle_source = [];
            t.loadSubtitle(t.tracks[running].src)
            t.renderSettingSubtitle()
        }
        t.audio.addEventListener("timeupdate", function () {
            if (t.subtitle && window[t.player_id].subtitle_source[running]) {
                t.modeSubtitle()
            }
        });
    }
    configModeSubtitle = {
        position: -1,
        track_text: "",
        stateHidden: true,
        last_element: undefined,
        callbackshow: function (cue) {
            this.last_element.style.display = "block";
            this.last_element.textContent = cue["text"];
        },
        callbackhide: function (cue) {
            this.last_element.style.display = "none";
            this.last_element.textContent = "";
        },
        setPostion: function (pos) {
            this.position = pos;
        },

    }
    modeSubtitle() {
        var running = window[this.player_id].subtitle_running;
        let cues = window[this.player_id].subtitle_source[running];
        let state = false;
        for (let i = 0; i < cues.length; i++) {
            if (this.audio.currentTime > cues[i].startTime && this.audio.currentTime < cues[i].endTime) {
                if (this.configModeSubtitle.position != i) {
                    if (this.configModeSubtitle.track_text[i] == undefined)
                        this.configModeSubtitle.last_element = this.configModeSubtitle.track_text[0];
                    else
                        this.configModeSubtitle.last_element = this.configModeSubtitle.track_text[i];
                    this.configModeSubtitle.callbackshow(cues[i]);
                    this.configModeSubtitle.setPostion(i);
                }
                state = true;
                this.configModeSubtitle.stateHidden = false;
                break;
            }
        }
        if (state == false && this.configModeSubtitle.stateHidden == false) {
            this.configModeSubtitle.stateHidden = true;
            this.configModeSubtitle.callbackhide()
        }
    }
    loadSubtitle(source) {
        var t = this;
        var xhr = new XMLHttpRequest();
        var player = document.getElementById(this.player_id);
        function reqListener() {
            var parser = new WebVTT.Parser(window, WebVTT.StringDecoder()),
                cues = [];
            parser.oncue = function (cue) {
                cues.push(cue);
                t.renderSubtitle(cue)
            };
            parser.parse(this.responseText);
            parser.flush();
            window[t.player_id].subtitle_source.push(cues)
            t.configModeSubtitle.track_text = player.querySelectorAll(".track_text");
        }
        xhr.addEventListener("load", reqListener);
        xhr.open("GET", source);
        xhr.send();
    }
    renderSubtitle(cue) {
        //console.log(cue)
    }
    renderSettingSubtitle() {
        var running = window[this.player_id].subtitle_running,
            running = running ? running : 0,
            text = this.tracks[running].label,
            player = document.getElementById(this.player_id),
            text_subtitle = player.querySelector(".text_subtitle");
        if (this.subtitle)
            text_subtitle.textContent = text;
        else
            text_subtitle.textContent = "Tắt";
    }
    renderSetttingListSubtitle() {
        var player = document.getElementById(this.player_id),
            subtitle_setting = player.querySelector(".subtitle_setting>.inner_item"),
            t = this,
            running = window[this.player_id].subtitle_running;
        if (!this.subtitle)
            subtitle_setting.querySelector(".item_tooltip[for_value='-1'] .content_tooltip").classList.add("tick"), player.querySelector(".text_subtitle").textContent = "Tắt";
        for (let i = 0; i < this.tracks.length; i++) {
            subtitle_setting.insertAdjacentHTML('beforeend', `<div class="item_tooltip" for_value="${i}">
                <span class="content_tooltip ${this.subtitle && running == i ? "tick" : ""}"></span>
                <span class="content_tooltip text_left">${this.tracks[i].label}</span>
            </div>`)
        }
        subtitle_setting.addEventListener("click", function (ev) {
            for (let i = 0; i < ev.path.length; i++) {
                if (ev.path[i].classList.contains("item_tooltip")) {
                    let value = ev.path[i].getAttribute("for_value");
                    if (value == "-1") {
                        t.subtitle = false;
                        t.renderSettingSubtitle()
                        t.toogleSubtitle()
                    }
                    else {
                        t.subtitle = true,
                            window[t.player_id].subtitle_running = parseInt(value)
                        t.toogleSubtitle()
                    }
                    ev.path[i].querySelector(".content_tooltip").classList.add("tick")
                    break
                }
            }
        })
    }
    renderSetttingListQuality() {
        var player = document.getElementById(this.player_id),
            quality_setting = player.querySelector(".quality_setting>.inner_item"),
            t = this,
            running = window[this.player_id].quality_running;
        player.querySelector(".text_quality").textContent = this.sources[running].quality;
        for (let i = 0; i < this.sources.length; i++) {
            quality_setting.insertAdjacentHTML('beforeend', `<div class="item_tooltip" for_value="${i}">
                <span class="content_tooltip ${running == i ? "tick" : ""}"></span>
                <span class="content_tooltip text_left">${this.sources[i].quality}</span>
            </div>`)
        }
        quality_setting.addEventListener("click", function (ev) {
            console.log(ev)
            for (let i = 0; i < ev.path.length; i++) {
                if (ev.path[i].classList.contains("item_tooltip")) {
                    let value = ev.path[i].getAttribute("for_value");
                    t.changeQuality(value)
                    ev.path[i].querySelector(".content_tooltip").classList.add("tick")
                    break
                }
            }
        })
    }
    changeQuality(index) {
        var player = document.getElementById(this.player_id),
            quality_setting = player.querySelector(".quality_setting>.inner_item"),
            quality_setting_item = quality_setting.querySelectorAll(".item_tooltip"),
            running = parseInt(index);
        if (this.sources[running] && window[this.player_id].quality_running != running) {
            var currentTime = this.audio.currentTime;
            window[this.player_id].quality_running = running;
            player.querySelector(".text_quality").textContent = this.sources[running].quality;
            this.audio.src = this.sources[running].src;
            audio.currentTime = currentTime;
            if (this.playing)
                this.audio.play()
        }
        for (let node of quality_setting_item) {
            node.querySelector(".content_tooltip").classList.remove("tick")
            if (node.getAttribute("for_value") == window[this.player_id].quality_running) {
                node.querySelector(".content_tooltip").classList.add("tick")
            }
        }
    }
    changeSpeed(speed) {
        var player = document.getElementById(this.player_id),
            speed_setting = player.querySelector(".speed_setting>.inner_item"),
            speed_setting_item = speed_setting.querySelectorAll(".item_tooltip"),
            speed = parseFloat(speed);
        this.audio.playbackRate = this.speed = speed;
        this.setFromStorage("speed", this.speed)
        player.querySelector(".text_speed").textContent = (speed == 1 ? "Chuẩn" : `x${speed}`)
        for (let node of speed_setting_item) {
            node.querySelector(".content_tooltip").classList.remove("tick")
            if (node.getAttribute("for_value") == this.speed) {
                node.querySelector(".content_tooltip").classList.add("tick")
            }
        }
    }
    changeVisualzer(mode) {
        var player = document.getElementById(this.player_id),
            visualizer_setting = player.querySelector(".visualizer_setting>.inner_item"),
            visualizer_setting_item = visualizer_setting.querySelectorAll(".item_tooltip"),
            mode = parseInt(mode),
            mode_arr_text = ["Tắt", "Mặc định"];
        if (this.visualizer != mode) {
            this.visualizer = mode;
            player.querySelector(".text_visualizer").textContent = mode_arr_text[mode]
            if (mode == 0) {
                this.visualizerClass.stop();
                player.querySelector(".thumbnail").classList.add("no_visualizer");
            }
            if (mode == 1) {
                if (this.visualizerClass) {
                    this.visualizerClass.resume();
                }
                else {
                    this.visualizerClass = new Visualizer("visualizer_circle", this.audio, {})
                    this.visualizerClass.start();
                }
                player.querySelector(".thumbnail").classList.remove("no_visualizer")
            }
        }
        for (let node of visualizer_setting_item) {
            node.querySelector(".content_tooltip").classList.remove("tick")
            if (node.getAttribute("for_value") == this.visualizer) {
                node.querySelector(".content_tooltip").classList.add("tick")
            }
        }
    }
}
class Visualizer {
    playing = false;
    constructor(element_id, node_audio, config) {
        this.element_id = element_id,
            this.node_audio = node_audio,
            this.config = config
    }
    start() {
        if (!this.audioContext) {
            this.canvas = document.getElementById(this.element_id)
            this.canvasContext = this.canvas.getContext('2d');
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.audio = this.node_audio;
            this.source = this.audioContext.createMediaElementSource(this.audio);
            this.analyser = this.audioContext.createAnalyser();
            this.playing = true;
            this.source.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);
            var t = this;
            this.audio.addEventListener("canplay", function () {
                t.Render()
            })
            this.audio.addEventListener("play", function () {
                t.Render()
            })
        }
    }
    Render() {
        var t = this;
        function call() {
            t.canvasContext.clearRect(0, 0, t.canvas.width, t.canvas.height);
            if (!t.audio.paused && t.playing) {
                var bufferLength = t.analyser.frequencyBinCount;
                var frequencyData = new Uint8Array(bufferLength);
                t.analyser.getByteFrequencyData(frequencyData);
                var circleRadius = t.canvas.height / 5,
                    frequencyHeight = 0,
                    x = 0;
                for (var increment = 0; increment < bufferLength; increment += 5) {
                    frequencyHeight = frequencyData[increment] * (t.canvas.height * 0.002);
                    t.canvasContext.beginPath();
                    var ax = t.canvas.width / 2 + (circleRadius * Math.cos(x * 1000));
                    var ay = t.canvas.height / 2 + (circleRadius * Math.sin(x * 1000));
                    var bx = t.canvas.width / 2 + ((circleRadius + frequencyHeight) * Math.cos(x * 1000));
                    var by = t.canvas.height / 2 + ((circleRadius + frequencyHeight) * Math.sin(x * 1000));
                    t.canvasContext.moveTo(ax, ay);
                    t.canvasContext.lineTo(bx, by);
                    t.canvasContext.lineWidth = 2;
                    t.canvasContext.strokeStyle = "#4d6db0";
                    t.canvasContext.stroke();
                    x += (2 * Math.PI) / (bufferLength);
                }
                requestAnimationFrame(call);
            }
        }
        call()
    }
    resume() {
        this.playing = true;
        this.Render()
    }
    stop() {
        this.playing = false;
    }
}
class Reaction {
    cache_storage = {}
    constructor(reaction_list, config) {
        this.reaction_list = reaction_list
        this.config = config
        this.addPosition();
    }
    randomPostion() {
        let coord = this.config.coordinates.list, //Array position
            config_coord = this.config.coordinates.config,
            choose_group = this.getRandomInt(0, coord.length),
            arrayX = coord[choose_group]["x"].sort(function (a, b) { return a - b; }),
            arrayY = coord[choose_group]["y"],
            randomPosY = arrayY[0],
            randomPosX = this.getRandomInt(arrayX[0], arrayX[1]);
        return [[randomPosX, coord[choose_group].x[1]], [randomPosY, coord[choose_group].y[1]]];
    }
    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min) + min);
    }
    run(element_canvas, audio) {
        class Item {
            constructor(icon, x, y, to_x, to_y, type) {
                this.from_x = x
                this.from_y = y;
                this.current_x = x;
                this.current_y = y;
                this.to_x = to_x;
                this.to_y = to_y;
                if (cache_storage[type]) {
                    this.IMG = cache_storage[type];
                }
                else {
                    this.IMG = new Image();
                    this.IMG.src = icon;
                    cache_storage[type] = this.IMG
                }
                this.speed = 5;
                this.pha = (this.to_y / 10);
                this.pha_total = 0;
                this.pha_turn = (this.current_x > this.pha + this.speed / 5 ? 0 : 1);
                this.opacity = 1;
                this.pha_delta = (this.speed / 5);
            }
            move(i) {
                //this.pha_delta = Math.sqrt(this.pha_delta);
                if (this.pha_turn == 1) {
                    this.pha_total += this.pha_delta,
                        this.current_x += this.pha_delta;
                    if (this.pha_total >= this.pha) {
                        this.pha_total = 0,
                            this.pha_turn = 0;
                    }
                }
                else {
                    this.pha_total += this.pha_delta,
                        this.current_x -= this.pha_delta;
                    if (this.pha_total >= this.pha) {
                        this.pha_total = 0,
                            this.pha_turn = 1;
                    }
                }
                ctx.save();
                if (this.from_y < this.to_y) {
                    this.current_y += this.speed;
                    if (this.current_y >= this.to_y - 100) {
                        if (this.opacity - 0.1 > 0)
                            this.opacity -= 0.1;
                    }
                }
                else {
                    this.current_y -= this.speed;
                    if (this.current_y <= this.to_y + 100) {
                        if (this.opacity - 0.1 > 0)
                            this.opacity -= 0.1;
                    }
                }
                ctx.globalAlpha = this.opacity;
                ctx.translate(this.current_x, this.current_y); // move to point
                ctx.drawImage(this.IMG, -30, -30, 30, 30);
                ctx.restore();
                if (this.current_y >= this.to_y && this.from_y < this.to_y) {
                    items.splice(i, 1);
                }
                else if (this.current_y <= this.to_y && this.from_y > this.to_y) {
                    items.splice(i, 1);
                }
            }
        }
        this.element_canvas = element_canvas;
        var cache_storage = this.cache_storage;
        var ctx = element_canvas.getContext('2d');
        let i = 0, reaction_list = this.getReactionList(), running = false;
        var items = [];
        function loop() {
            ctx.clearRect(0, 0, element_canvas.width, element_canvas.height);
            let i = 0;
            items.forEach(function (item) {
                item.move(i)
                i++;
            });
            running = false;
            if (items.length) {
                running = true;
                requestAnimationFrame(loop);
            }
        };
        audio.addEventListener("timeupdate", function () {
            if (reaction_list[i]) {
                if (audio.currentTime > reaction_list[i]["time"]) {
                    let from_x = reaction_list[i].coord[0][0],
                        to_x = reaction_list[i].coord[0][1],
                        from_y = reaction_list[i].coord[1][0],
                        to_y = reaction_list[i].coord[1][1];
                    var item = new Item(reaction_list[i].icon, from_x, from_y, to_x, to_y, reaction_list[i].type);
                    items.push(item);
                    if (running == false)
                        loop()
                    i++;
                }
            }
        });
    }
    addPosition() {
        for (var reaction of this.reaction_list) {
            reaction.coord = this.randomPostion();
        }
    }
    add(object) {
        var object = object;
        object.coord = this.addPosition()
        this.reaction_list.push(object)
    }
    remove(position) {
        return delete this.reaction_list[position]
    }
    getReactionList() {
        return this.reaction_list;
    }
}
class DOM {
    constructor(player_id, config) {
        this.player_id = player_id;
        this.config = config;
        //console.log(config)
        //Do edit class, all class is important, you can push class, id, attribute,...
    }
    setPlayerID(player_id) {
        this.player_id = player_id;
    }
    setConfig(config) {
        this.config = config;
    }
    createPlayer(dom) {
        if (dom)
            return dom;
        else {
            return `<div class="lifemusic_player" id="${this.player_id}">
                ${this.createPlayerOutner()}
                ${this.createAudio()}
            </div>`;
        }
    }
    createPlayerOutner(dom) {
        if (dom)
            return dom;
        else {
            return `<div class="player_outner">
                ${this.createMoreInfo()}
                ${this.createDisplayInfo()}
                ${this.createDisplayController()}
            </div>`;
        }
    }
    createMoreInfo(dom) {
        if (dom)
            return dom;
        else {
            return `<div class="more_info">
                <div class="inner_more_info">${this.createReactionTarget()}</div>
            </div>`;
        }
    }
    createReactionTarget(dom) {
        if (dom)
            return dom;
        else {
            if (this.config.reactions) {
                if (this.config.reactions.list) {
                    let source_html = "", i = 0;
                    for (let item of this.config.reactions.list) {
                        source_html += `<div class="reaction_item group_button" for_value="${i}">
                                            <div class="btn_builder btn_size_normal" style="${item.icon ? `mask: url('${item.icon}') no-repeat 100% 100%; -webkit-mask: url('${item.icon}') no-repeat 100% 100%;` : ""}"></div>
                                            <div>${item.count}</div>
                                        </div>`;
                        i++;
                    }
                    return source_html;
                }
                else return "";
            }
            else return "";
        }
    }
    createDisplayInfo(dom) {
        if (dom)
            return dom;
        else {
            return `<div class="display_info group_row">
                    ${this.createToastInfo()}
                    ${this.createThumbnail()}
                    ${this.createTrack()}
                    ${this.createLogo()}
                    ${this.createTitle()}
                    </div>`
        }
    }
    createToastInfo(dom) {
        if (dom)
            return dom;
        else {
            return `<div class="toast_info">
                        <div class="group_button" style="height: 100%">
                            <div class="ounner_image_icon">
                              <div class="image_toast btn_builder" style="height: 100%; width: 100%;"></div>
                            </div>
                            <div class="text_toast"></div>
                        </div>
                    </div>`
        }
    }
    createThumbnail(dom) {
        if (dom)
            return dom;
        else {
            return `<div class="thumbnail">
                        <div class="thumbnail_inner">
                            <div class="time_current_svg">
                                <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 36 36">
                                    <circle cx="18" cy="18" r="17.5" fill="none" stroke="#098afb" stroke-width="1" class="time_current_svg_attach"></circle>
                                </svg>
                            </div>
                            ${renderThumbnail.bind(this)()}
                         </div>
                        <canvas id="visualizer_circle" width="250" height="250"></canvas>
                    </div>`;
        }
        function renderThumbnail() {
            return (this.config.thumbnail_img ? `<img src="${this.config.thumbnail_img}" />` : `<div class="no_thumbnail"></div>`);
        }
    }
    createTrack(dom) {
        if (dom)
            return dom;
        else {
            return `<div class="track group_row">
                        <div class="track_text"></div>
                    </div>`
        }
    }
    createLogo(dom) {
        if (dom)
            return dom;
        else {
            return `<div class="lifemusic_logo" style="${renderStyle.bind(this)()}"></div>`
        }
        function renderStyle() {
            if (this.config.logo) {
                if (this.config.logo.src) {
                    let top = this.config.logo.position.top,
                        bottom = this.config.logo.position.bottom,
                        left = this.config.logo.position.left,
                        right = this.config.logo.position.right,
                        default_vertical = (!top && !bottom ? 0 : undefined), //this for top
                        default_horizontal = (!left && !right ? 0 : undefined), //this for right
                        width = (this.config.logo.size.width ? this.config.logo.size.width : 50),
                        height = (this.config.logo.size.height ? this.config.logo.size.height : 50);
                    return `${top && default_vertical ? `top: ${top}px;` : `top: ${default_vertical}px;`}
                                ${left ? `left: ${left}px;` : ""}
                                ${bottom ? `bottom: ${bottom}px;` : ""}
                                ${right && default_horizontal ? `right: ${right}px;` : `right: ${default_horizontal}px;`}
                                background-image: url('${this.config.logo.src}');
                                width: ${width}px; height: ${height}px;`;

                }
            }
        }
    }
    createTitle(dom) {
        if (dom)
            return dom;
        else {
            if (this.config.titlegroup) {
                return `<div class="lifemusic_titleGroup" style="${renderStyle.bind(this)()}">
            <div class="lifemusic_titleGroup_title">${this.config.titlegroup.title.text ? this.config.titlegroup.title.text : ""}</div>
            <div class="lifemusic_titleGroup_artist">${this.config.titlegroup.artist.text ? this.config.titlegroup.artist.text : ""}</div>
        </div>`
            }
            else return "";
        }
        function renderStyle() {
            if (this.config.titlegroup) {
                let top = this.config.titlegroup.position.top,
                    bottom = this.config.titlegroup.position.bottom,
                    left = this.config.titlegroup.position.left,
                    right = this.config.titlegroup.position.right,
                    default_vertical = (!top && !bottom ? 0 : undefined), //this for bottom
                    default_horizontal = (!left && !right ? 0 : undefined); //this for right
                return `${top && default_vertical ? `bottom: ${bottom}px;` : `bottom: ${default_vertical}px;`}
                        ${left ? `left: ${left}px;` : ""}
                        ${top ? `top: ${top}px;` : ""}
                        ${right && default_horizontal ? `right: ${right}px;` : `right: ${default_horizontal}px;`}`;
            }
        }
    }
    createDisplayController(dom) {
        if (dom)
            return dom;
        else {
            return `<div class="display_controller">
                        <div class="controller_inner">
                            ${this.createTimeProgressBar()}
                            ${this.createButtonController()}
                        </div>
                    </div>`
        }
    }
    createTimeProgressBar(dom) {
        if (dom)
            return dom;
        else {
            return `<div class="time_progress_bar">
                        <div class="current_progress"></div>
                        <div class="seek_dot"></div>
                        <div class="healthy_bar"></div>
                        <div class="text_time"></div>
                    </div>`;
        }
    }
    createButtonController(dom) {
        return `<div class="button_controller">
            ${this.createButtonControllerStart(dom)}
            ${this.createButtonControllerEnd(dom)}
        </div>`;
    }
    createButtonControllerStart(dom) {
        if (dom)
            return dom;
        else {
            return `<div class="button_start">
                <button class="btn_player btn_builder btn_pausing"></button>
                <div class="group_button group_volume">
                    <button class="btn_volume btn_builder btn_size_normal"></button>
                    <div class="volume_bar">
                        <div class="progress_volume"></div>
                    </div>
                </div>
                <button class="btn_fast_forward btn_builder btn_size_normal"></button>
                <button class="btn_loop btn_builder btn_size_normal"></button>
            </div>`
        }
    }
    createButtonControllerEnd(dom) {
        if (dom)
            return dom;
        else {
            return `<div class="button_end">
                        <button class="btn_subtitles btn_builder btn_size_normal"></button>
                        ${this.createToolTip()}
                        ${this.createTimmer()}
                        ${this.createChapter()}
                    </div>`;
        }
    }
    createToolTip(dom) {
        if (dom)
            return dom;
        else {
            return `<div class="group_tooltip">
                    <button class="btn_setting btn_builder btn_size_normal"></button>
                    ${this.createModalTooltip()}
                </div>`;
        }
    }
    createModalTooltip(dom) {
        if (dom)
            return dom;
        else {
            return `<div class="modal_tooltip">
                        <div class="content_modal grid_row">
                            ${this.createModalMainSetting()}
                            ${this.createModalSubSetting()}
                        </div>
                    </div>`
        }
    }
    createModalMainSetting(dom) {
        if (dom)
            return dom;
        else {
            return `<div class="main_setting">
                    <div class="item_tooltip group_button" aria-hastooltip="true" for="subtitle_setting">
                        <div class="text_tooltip">Phụ đề</div>
                        <div class="content_tooltip text_subtitle">Có</div>
                    </div>
                    <div class="item_tooltip group_button" aria-hastooltip="true" for="quality_setting">
                        <div class="text_tooltip">Chất lượng</div>
                        <div class="content_tooltip text_quality">320kbps</div>
                    </div>
                    <div class="item_tooltip group_button" aria-hastooltip="true" for="speed_setting">
                        <div class="text_tooltip">Tốc độ phát</div>
                        <div class="content_tooltip text_speed">Chuẩn</div>
                    </div>
                    <div class="item_tooltip group_button" aria-hastooltip="true" for="visualizer_setting">
                        <div class="text_tooltip">Visualizer</div>
                        <div class="content_tooltip text_visualizer">Mặc định</div>
                    </div>
                    </div>`
        }
    }
    createModalSubSetting(dom) {
        if (dom)
            return dom;
        else {
            return `<div class="sub_setting">
            <div class="subtitle_setting">
                <div class="header_tooltip">
                    Phụ đề
                </div>
                <div class="inner_item">
                    <div class="item_tooltip" for_value="-1">
                        <span class="content_tooltip"></span>
                        <span class="content_tooltip text_left">Tắt</span>
                    </div>
                </div>
            </div>
            <div class="quality_setting">
                <div class="header_tooltip">
                    Chất lượng
                </div>
                <div class="inner_item">
                </div>
            </div>
            <div class="speed_setting">
                <div class="header_tooltip">
                    Tốc độ phát
                </div>
                <div class="inner_item">
                    <div class="item_tooltip" for_value="0.25">
                        <span class="content_tooltip"></span>
                        <span class="content_tooltip text_left">x0.25</span>
                    </div>
                    <div class="item_tooltip" for_value="0.5">
                        <span class="content_tooltip"></span>
                        <span class="content_tooltip text_left">x0.5</span>
                    </div>
                    <div class="item_tooltip" for_value="0.75">
                        <span class="content_tooltip"></span>
                        <span class="content_tooltip text_left">x0.75</span>
                    </div>
                    <div class="item_tooltip" for_value="1">
                        <span class="content_tooltip"></span>
                        <span class="content_tooltip text_left">x1 (Chuẩn)</span>
                    </div>
                    <div class="item_tooltip" for_value="1.25">
                        <span class="content_tooltip"></span>
                        <span class="content_tooltip text_left">x1.25</span>
                    </div>
                    <div class="item_tooltip" for_value="1.5">
                        <span class="content_tooltip"></span>
                        <span class="content_tooltip text_left">x1.5</span>
                    </div>
                    <div class="item_tooltip" for_value="1.75">
                        <span class="content_tooltip"></span>
                        <span class="content_tooltip text_left">x1.75</span>
                    </div>
                    <div class="item_tooltip" for_value="2">
                        <span class="content_tooltip"></span>
                        <span class="content_tooltip text_left">x2</span>
                    </div>
                </div>
            </div>
            <div class="visualizer_setting">
                <div class="header_tooltip">
                    Visualizer
                </div>
                <div class="inner_item">
                    <div class="item_tooltip" for_value="0">
                        <span class="content_tooltip ${!this.config.visualizer ? "tick" : ""}"></span>
                        <span class="content_tooltip text_left">Tắt</span>
                    </div>
                    <div class="item_tooltip" for_value="1">
                        <span class="content_tooltip ${this.config.visualizer == 1 ? "tick" : ""}"></span>
                        <span class="content_tooltip text_left">Mặc định</span>
                    </div>
                </div>
            </div>
        </div>`
        }
    }
    createTimmer(dom) {
        if (dom)
            return dom;
        else {
            return `<span class="time_current">00:00</span>
            <span>/</span>
            <span class="time_total">--</span>`
        }
    }
    createChapter(dom) {
        if (dom)
            return dom;
        else {
            if (this.config.chapters) {
                return `<div class="group_button chapter_group"><div class="text_chapter"></div></div>`
            }
            else return '';
        }
    }
    createAudio(dom) {
        if (dom)
            return dom;
        else {
            if (this.config.sources) {
                var running = window[this.player_id].quality_running = 0;
                let source_html = `<source src="${(this.config.sources[running].src ? this.config.sources[running].src : "")}" type="${(this.config.sources[running].type ? this.config.sources[running].type : "")}">`
                return `<audio controls="false" style="display: none">${source_html}</audio>`
            }
            else return '';
        }
    }
}