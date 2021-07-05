class DesktopDom extends DOM {
    constructor(player_id, config) {
        super(player_id, config)
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
    createPlayerOutner(dom) {
        return `<div class="player_outner">
                ${this.createMoreInfo()}
                <div class="flex-50-50 full_height">
                ${this.createDisplayInfo()}
                ${this.createTrack()}
                </div>
            </div>`;
    }
    createDisplayInfo(dom) {
        return `<div class="display_info group_row">
                    ${this.createToastInfo()}
                    ${this.createThumbnail()}
                    ${this.createDisplayController()}
                    ${this.createLogo()}
                    ${this.createTitle()}
                    </div>`
    }
    createTrack() {
        return `<div class="track"></div>`
    }
}