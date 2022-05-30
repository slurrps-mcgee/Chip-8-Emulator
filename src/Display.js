import { CHAR_SET_WIDTH } from './Constants/CharSetConstants';
import { DISPLAY_HEIGHT, DISPLAY_WIDTH, DISPLAY_MULTIPLY, BG_COLOR, COLOR } from './Constants/DisplayConstants'

export class Display {
    //Constructor
    constructor(memory) {
        //Set memory to incomming memory
        this.memory = memory;
        //Set screen to the canvas on the html file
        this.screen = document.querySelector('canvas'); /*Grabs the screen from html*/

        /*Screen Height and Width*/
        this.screen.width = DISPLAY_WIDTH * DISPLAY_MULTIPLY;
        this.screen.height = DISPLAY_HEIGHT * DISPLAY_MULTIPLY;

        //Set Context to 2D from screen
        this.context = this.screen.getContext('2d'); /*Grabs screen context*/

        //Set Screen background color
        this.context.fillStyle = BG_COLOR; /*Screen Background Color*/

        //Create a empty frame buffer
        this.frameBuffer = []; /*Create a frame buffer*/

        //Reset the Display
        this.reset(); /*Reset the display*/

        //this.draw();
    }

    //Reset Screen
    reset() {
        /*Loop through display height*/
        for (let i = 0; i < DISPLAY_HEIGHT; i++) {
            //Create Push event
            this.frameBuffer.push([]);

            /*Loop through display width*/
            for (let j = 0; j < DISPLAY_WIDTH; j++) {
                //Push all 0's to framebuffer
                this.frameBuffer[i].push(0);
            }
        }
        //Fill Background Rect of the screen
        this.context.fillRect(0, 0, this.screen.width, this.screen.height);
        //Draw the screen Buffer
        this.drawBuffer();
    }

    //Draw Screen Buffer
    drawBuffer() {

        //Loop through display height
        for (let h = 0; h < DISPLAY_HEIGHT; h++) {
            //Loop through display width
            for (let w = 0; w < DISPLAY_WIDTH; w++) {
                //draw pixel onto screen using h,w, and the value from the framebuffer location
                this.drawPixel(h, w, this.frameBuffer[h][w]);
            }
        }

    }

    //Draws Pixels to the screen
    drawPixel(h, w, value) {
        //Check if value is 1 or 0
        if (value) {
            //Pixel On
            this.context.fillStyle = COLOR;
        }
        else {
            //Pixel Off
            this.context.fillStyle = BG_COLOR;
        }

        //Fill Rectangle Screen
        this.context.fillRect(
            w * DISPLAY_MULTIPLY,
            h * DISPLAY_MULTIPLY,
            DISPLAY_MULTIPLY,
            DISPLAY_MULTIPLY);
    }

    //Draws Sprites to the screen
    drawSprite(h, w, spriteAddress, lineCount) {
        let pixelColision = 0;

        //Loop through sprites line height
        for (let lh = 0; lh < lineCount; lh++) {

            const line = this.memory.memory[spriteAddress + lh]; //Read Line

            //Loop through sprite line width
            for (let lw = 0; lw < CHAR_SET_WIDTH; lw++) {


                const bitToCheck = (0b10000000 >> lw); //Shift to the right
                const value = line & bitToCheck; //Set value to line & bitToCheck Value
                if (value === 0) {
                    continue;
                }

                const ph = (h + lh) % DISPLAY_HEIGHT; //pixel height
                const pw = (w + lw) % DISPLAY_WIDTH; //pixel width

                if (this.frameBuffer[ph][pw] === 1) {
                    pixelColision = 1;
                }
                this.frameBuffer[ph][pw] ^= 1; //XOR Pixel collision
            }
        }
        this.drawBuffer();
        return pixelColision; //Return pixelCollision
    }
}