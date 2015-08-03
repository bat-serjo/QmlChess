import QtQuick 2.0

Item {
    id: figure

    property var kind: "bp"
    property var row: 0
    property var col: 0
    property bool alive: true

    Image {
        id: img

        source: {
            if (kind == "bp") {return "images/black/pawn.svg"}
            if (kind == "bb") {return "images/black/bishop.svg"}
            if (kind == "br") {return "images/black/rook.svg"}
            if (kind == "bh") {return "images/black/horse.svg"}
            if (kind == "bq") {return "images/black/queen.svg"}
            if (kind == "bk") {return "images/black/king.svg"}

            if (kind == "wp") {return "images/white/pawn.svg"}
            if (kind == "wb") {return "images/white/bishop.svg"}
            if (kind == "wr") {return "images/white/rook.svg"}
            if (kind == "wh") {return "images/white/horse.svg"}
            if (kind == "wq") {return "images/white/queen.svg"}
            if (kind == "wk") {return "images/white/king.svg"}
        }

        // make the figures 70% of the rectangle
        width:  (body.blockSizeX * 0.7)
        height: (body.blockSizeY * 0.7)

        // Calculate the xy coordinates based on the position
        y: row * body.blockSizeY + (body.blockSizeY * 0.15)
        x: col * body.blockSizeX + (body.blockSizeX * 0.15)

    }
}

