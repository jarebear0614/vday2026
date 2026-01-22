let myAction = tiled.registerAction("AddTilesetAnimations", function(action) {
	//do your thing
    let asset = tiled.activeAsset;
    console.log(asset);
    if(!asset.isTileset) 
    {
        tiled.alert("Please open a tileset first.");
        return;
    }

    let tileset = asset;

    for(let i = 0; i < tileset.tiles.length; ++i)
    {
        let tile = tileset.tiles[i].frames = [];
    }

    let frameCount = 4;
    let perRow = 48;
    let spacing = 12;

    let rows = 16;

    let frameDuration = 200; //ms

    for(let r = 0; r < rows; r += 1)
    {
        for(let c = r * perRow; c < (r * perRow) + spacing; ++c)
        {            
            let tile = tileset.tile(c);
            if(!tile)
            {
                tiled.warn('no tile at' + c);
                continue;
            }

            let frames = [];

            for(let f = c; f < c + (spacing * frameCount); f += spacing)
            {
                frames.push({
                    tileId: f,
                    duration: frameDuration
                });
            }

            for(let f = (c + (frameCount - 1) * spacing); f >= c; f -= spacing)
            {
                frames.push({
                    tileId: f,
                    duration: frameDuration
                });
            }

            tile.frames = frames;
        }
    }
});
myAction.text = "Add Tileset Animations"; //display name for the action

//Add it to the Tileset menu. If you want it somewhere else, you can choose a different menu.
//If you type tiled.menus into the Tiled console, you can see a full list of modifiable menus.
tiled.extendMenu("Tileset", [
	{ action: "AddTilesetAnimations", before: "TilesetProperties" }
]);