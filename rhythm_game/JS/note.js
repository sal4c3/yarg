// the note piece itself
class Note {
    constructor(htmlID, ypos, imgPath, imgWidth, imgHeight, keyBind) {
        this.id = htmlID;
        this.y = ypos;
        this.img = imgPath;
        this.width = imgWidth;
        this.height = imgHeight;
        this.key = keyBind;

        this.speed = 2;
        this.pressed = false;
        this.status = "MISS";
        this.accuracy = 0;
        this.order = 0;
    }

    // moving down
    noteScroll() {
        this.y += this.speed;
    }
}