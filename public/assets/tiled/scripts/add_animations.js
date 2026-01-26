let myAction = tiled.registerAction("AddTilesetAnimations", function(action) {
	//do your thing
    let asset = tiled.activeAsset;
    if(!asset.isTileset) 
    {
        tiled.alert("Please open a tileset first.");
        return;
    }

    let tileset = asset;

    for(let i = 0; i < tileset.tiles.length; ++i)
    {
        tileset.tiles[i].frames = [];
    }

    let frameCount = tileset.property('frameCount');
    let perRow = tileset.property('perRow');
    let spacing = tileset.property('spacing');
    let rows = tileset.property('rows');
    let frameDuration = tileset.property('defaultFrameDuration'); //ms
    let loopBack = tileset.property('loopBack') ?? false;

    let ignoreTileIds = tileset.property('ignoreTileIds').trim().length == 0 ? [] : tileset.property('ignoreTileIds').trim().split(',');
    let ignoreTileIdsProcessed = ignoreTileIds.map((s) => { return parseInt(s); });

    for(let r = 0; r < rows; r += 1)
    {
        for(let c = r * perRow; c < (r * perRow) + spacing; ++c)
        {            
            if(ignoreTileIdsProcessed.find((f) => {return f == c}))
            {
                continue;
            }

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

            if(loopBack)
            {
                for(let f = (c + (frameCount - 1) * spacing); f >= c; f -= spacing)
                {
                    frames.push({
                        tileId: f,
                        duration: frameDuration
                    });
                }
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