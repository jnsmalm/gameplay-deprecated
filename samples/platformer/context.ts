import * as $ from "../../lib/lib"

export class GraphicsContext {
    camera: $.Camera;
    spriteBatch: $.SpriteBatch;

    constructor() {
        // Disable culling to see the player walking in both directions.
        $.Game.graphics.rasterizerState = "cullNone";
        
        this.camera = $.Camera.createDefault($.Game.window);
        this.camera.transform.localPosition.z = 14;
        this.spriteBatch = new $.SpriteBatch($.Game.graphics, this.camera);
    }
}