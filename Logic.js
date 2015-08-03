.import QtQuick 2.0 as Quick

var FigCmp;

var brdSize = (8*8)
var PlayerColors = {
    WHITE: 0,
    BLACK: 1
}


function FigureHolder() {
    this.figs = {
        'wp': [],
        'bp': [],
        'wr': [],
        'br': [],
        'wh': [],
        'bh': [],
        'wb': [],
        'bb': [],
        'wk': [],
        'bk': [],
        'wq': [],
        'bq': []
    }


    this.put = function (fig) {
        if ( this.figs.hasOwnProperty(fig.kind) == true ) {
            this.figs[fig.kind].push(fig)
        } else {
            this.figs[fig.kind] = [fig]
        }
    }

    this.get = function (kind) {
        if (kind == "") {return null}
        return this.figs[kind].pop()
    }

}

// A chess class
function Chess(  ) {

    this.allFigures = null

    // the body representation - array of objects
    this.context = [brdSize]
    this.curTurn = PlayerColors.WHITE

    ///////////////////////////////////////////
    // History logic
    ///////////////////////////////////////////

    // history of the game - serialized copy of the context
    this.history = []
    this.replayHistIndex = 1

    this.clearHistory = function () {
        this.history = []
        this.replayHistIndex = 0
    }

    this.pushHistoryState = function () {
        var state = []

        for (var i=0; i < this.context.length; i++ ) {
            var add = ""
            var obj = this.context[i]
            if (obj != null) { add = obj.kind }
            state.push( add )
        }

        this.history.push( state )
    }

    this.restoreFromCtx = function( idx ) {
        var maxShot = this.history.length / brdSize;

        this.clearBoard()

        for (var i=0; i < brdSize; i++) {
            var obj = this.history[i+idx]
            if (obj == null) continue

            var fig = this.allFigures.get( obj )

            if ( fig == null ) {
                this.context[i] = null
            } else {
                var r,c
                var tmp = this.rowColFromIndex(i)
                r = tmp[0]
                c = tmp[1]
                this.putFigAt(fig, r, c)
            }
        }
    }

    this.histPrev = function () {
        if (this.replayHistIndex > 0) {
            this.replayHistIndex--
            this.restoreFromCtx( this.replayHistIndex*brdSize )
        }

    }

    this.histNext = function () {
        var maxShot = this.history.length / brdSize;
        if ( this.replayHistIndex < maxShot ) {
            this.replayHistIndex++
            this.restoreFromCtx( this.replayHistIndex*brdSize )
        }
    }

    this.loadGame  = function ( fname ) {
        fio.setSource( fname )
        var data = fio.read()

        if ( this.allFogures == null ) {
            this.allFigures = createFigures()
        }

        this.history = data.split(",")
        this.replayHistIndex = 0

        this.restoreFromCtx( this.replayHistIndex )
    }

    this.saveGame = function ( fname ) {
        fio.setSource(fname)
        fio.write(""+this.history)
    }

    ///////////////////////////////////////////
    // Chess logic
    ///////////////////////////////////////////

    // row & col to array index
    this.toIndex = function(r, c) {
        return c + (r*8)
    }

    this.rowColFromIndex = function(i) {
        var r = Math.floor(i/8)
        var c = Math.floor(i%8)
        return [r,c]
    }

    this.clearBoard = function () {
        for (var i=0; i < this.context.length; i++ ){
            var obj = this.context[i]
            if ( obj != null) {
                this.takeOver(obj)
            }
        }
    }

    this.initialPosition = function() {
        var obj

        if (this.allFigures == null) {
            // This has to be late initialization
            // The qml elements must exists prior to calling this
            // Otherwise the objects lack parents or smth.
            this.allFigures = createFigures()
        }

        // clear the hisory
        this.clearHistory()

        // clear the board
        this.clearBoard()

        // initialize turn
        this.curTurn = PlayerColors.WHITE

        //pawns
        for(var i=0; i < 8; i++) {
            obj = this.allFigures.get("bp"); this.putFigAt(obj, 1, i)
        }

        // rooks
        obj = this.allFigures.get("br"); this.putFigAt(obj, 0, 0)
        obj = this.allFigures.get("br"); this.putFigAt(obj, 0, 7)

        // knights - horses in this abreviation
        obj = this.allFigures.get("bh"); this.putFigAt(obj, 0, 1)
        obj = this.allFigures.get("bh"); this.putFigAt(obj, 0, 6)

        // bishops
        obj = this.allFigures.get("bb"); this.putFigAt(obj, 0, 2)
        obj = this.allFigures.get("bb"); this.putFigAt(obj, 0, 5)

        // king and queen
        obj = this.allFigures.get("bq"); this.putFigAt(obj, 0, 3)
        obj = this.allFigures.get("bk"); this.putFigAt(obj, 0, 4)

        // Create whites
        //pawns
        for(var i=0; i < 8; i++) {
            obj = this.allFigures.get("wp"); this.putFigAt(obj, 6, i)
        }

        // rooks
        obj = this.allFigures.get("wr"); this.putFigAt(obj, 7, 0)
        obj = this.allFigures.get("wr"); this.putFigAt(obj, 7, 7)

        // knights - horses in this abreviation
        obj = this.allFigures.get("wh"); this.putFigAt(obj, 7, 1)
        obj = this.allFigures.get("wh"); this.putFigAt(obj, 7, 6)

        // bishops
        obj = this.allFigures.get("wb"); this.putFigAt(obj, 7, 2)
        obj = this.allFigures.get("wb"); this.putFigAt(obj, 7, 5)

        // king and queen
        obj = this.allFigures.get("wq"); this.putFigAt(obj, 7, 3)
        obj = this.allFigures.get("wk"); this.putFigAt(obj, 7, 4)

        this.pushHistoryState()
    }


    this.changeTurn = function() {
        if (this.curTurn == PlayerColors.WHITE) {
            this.curTurn = PlayerColors.BLACK
        } else {
            this.curTurn = PlayerColors.WHITE
        }
    }

    // transform x,y to row & col
    this.coordsToRowCol = function(x,y) {
        var row = Math.floor(y / body.blockSizeY)
        var col = Math.floor(x / body.blockSizeX)
        return [row,col]
    }

    // get the figure at given coordinates, null if none
    this.coordsToFig = function (x,y) {
        var rc = this.coordsToRowCol(x,y)
        return this.context[ this.toIndex(rc[0], rc[1]) ]
    }

    // gives the color of the figure at row & col.
    // If there is no figure there return null
    this.getFigColor = function(fig) {
        var charColor = fig.kind[0]
        if (charColor == "w") { return PlayerColors.WHITE }
        if (charColor == "b") { return PlayerColors.BLACK }
        throw "Invalid figure at "+row+":"+col
    }

    // put the figure there, no questions asked
    this.putFigAt = function(fig, row, col) {
        if (fig == null) console.trace()

        if ( this.context[ this.toIndex(fig.row, fig.col) ] == fig ) {
             this.context[ this.toIndex(fig.row, fig.col) ] = null
        }

        fig.row = row
        fig.col = col
        fig.visible = true

        this.context[this.toIndex(row,col)] = fig
    }

    // get the figure at row & col or null
    this.getFigAt = function(row, col) {
        return this.context[ this.toIndex(row, col) ]
    }

    // kill this figure
    this.takeOver = function (fig) {
        this.context[ this.toIndex(fig.row, fig.col) ] = null
        fig.row = 0
        fig.col = 0
        fig.visible = false
        this.allFigures.put(fig)
    }

    // check if the figure fig can take over what's on drow, dcol
    // is possible take it over
    // return false - means you can't do it
    // return true  - you can put it there
    this.checkAndTakeOver = function(fig, drow, dcol) {
        var curFigColor = this.getFigColor(fig)
        var dstFig      = this.getFigAt( drow, dcol )

        if ( dstFig != null ) {
            if ( this.getFigColor( dstFig ) == curFigColor ) {
                // can't take over your own figures
                return false
            } else {
                this.takeOver( dstFig )
                return true
            }
        }

        // if the box is empty we can still put the fig there
        return true
    }

    // pointer to the selected figure
    this.selectedFig = null

    this.handleSelection = function (mouse) {
        var fig = this.coordsToFig(mouse.x, mouse.y)

        if ( fig != null ) {
            var figColor = this.getFigColor( fig )
            if ( figColor != this.curTurn ) { return }

            if ( this.selectedFig != null && this.selectedFig != fig ) {
                this.selectedFig.opacity = 1.0
            }

            fig.opacity = 0.3
            this.selectedFig = fig
        }
    }

    ///////////////////////////////////////////////
    // Movement rules
    ///////////////////////////////////////////////

    ///////////////////////////////////////////////
    // PAWN
    ///////////////////////////////////////////////
    this.handlePawn = function( fig, drow, dcol ) {
        var figColor = this.getFigColor( fig )
        var figDirection = ( figColor == PlayerColors.WHITE ) ? -1 : 1

        function isFirstMove() {
            if ( figColor == PlayerColors.BLACK && fig.row == 1 ) { return true }
            if ( figColor == PlayerColors.WHITE && fig.row == 6 ) { return true }
            return false
        }

        function columnTakeOver( chessObj ) {
            var dstFig = chessObj.getFigAt( drow, dcol )

            if (dstFig == null) {
                return false
            } else {
                var dstColor = chessObj.getFigColor( dstFig )
                if ( dstColor == figColor ) { return false }
                chessObj.takeOver( dstFig )
                return true;
            }
        }

        var difRow = Math.abs(fig.row - drow)
        var difCol = Math.abs(fig.col - dcol)

        if (difCol > 1) { return false }
        if ( isFirstMove() == true  && difRow > 2) { return false }
        if ( isFirstMove() == false && difRow > 1) { return false }

        if (figColor == PlayerColors.BLACK) {
            if (drow < fig.row) { return false }
        } else {
            if (drow > fig.row) {return false}
        }

        if ( difCol != 0 ) {
            return columnTakeOver(this)
        } else {
            if ( this.getFigAt(drow, dcol) != null ) { return false }
        }

        return true
    }

    ///////////////////////////////////////////////
    // ROOK
    ///////////////////////////////////////////////
    this.handleRook = function( fig, drow, dcol ) {

        function moveRule() {
            if ( (fig.row == drow && fig.col != dcol) ||
                 (fig.col == dcol && fig.row != drow) ) {
                return true
            }
            return false;
        }

        function checkColision( chessObj ) {
            var sigR = (fig.row < drow) ? 1 : -1;
            var sigC = (fig.col < dcol) ? 1 : -1;

            if ( fig.row != drow ) { // iterate on rows
                for ( var cR = fig.row; cR != drow; cR += sigR ) {
                    var ret = chessObj.getFigAt( cR, fig.col )
                    if (ret != null && ret != fig) { return false }
                }
            } else { // iterate on cols
                for ( var cC = fig.col; cC != dcol; cC += sigC ) {
                    var ret = chessObj.getFigAt( fig.row, cC )
                    if (ret != null && ret != fig) { return false }
                }
            }

            return chessObj.checkAndTakeOver( fig, drow, dcol )
        }

        // if the move is not allowed at all no need to check anything else
        if (moveRule() == false) { return false }

        return checkColision(this)
    }

    ///////////////////////////////////////////////
    // KNIGHT
    ///////////////////////////////////////////////
    this.handleKnight = function( fig, drow, dcol ) {
        var curFigCol = this.getFigColor(fig)

        function moveRule() {
            var difRow = Math.abs( fig.row - drow )
            var difCol = Math.abs( fig.col - dcol )

            if ( (difRow == 2 && difCol == 1) ||
                 (difRow == 1 && difCol == 2)   ) {
                return true
            }
            return false
        }

        if ( moveRule() == false ) {return false}

        return this.checkAndTakeOver( fig, drow, dcol )
    }

    ///////////////////////////////////////////////
    // BISHOP
    ///////////////////////////////////////////////
    this.handleBishop = function( fig, drow, dcol ) {
        function moveRule() {
            var difRow = Math.abs( fig.row - drow )
            var difCol = Math.abs( fig.col - dcol )
            if (difRow == difCol) {
                return true
            }
            return false
        }

        function checkColision( chessObj ) {
            var sigR = (fig.row < drow) ? 1 : -1
            var sigC = (fig.col < dcol) ? 1 : -1
            var cR, cC

            for(cR = fig.row, cC = fig.col; cR != drow && cC != dcol; cR += sigR, cC += sigC ) {
                var ret = chessObj.getFigAt( cR, cC )
                if (ret != null && ret != fig) { return false }
            }

            return chessObj.checkAndTakeOver(fig, drow, dcol)
        }

        if ( moveRule() == false ) { return false }

        return checkColision( this )
    }

    // b.s. inheritance :)
    ///////////////////////////////////////////////
    // QUEEN
    ///////////////////////////////////////////////
    this.handleQueen = function( fig, drow, dcol ) {
        if ((this.handleRook  (fig, drow, dcol) == true) ||
            (this.handleBishop(fig, drow, dcol) == true)   ) {
            return true
        }
        return false
    }

    ///////////////////////////////////////////////
    // KING
    ///////////////////////////////////////////////
    this.handleKing = function( fig, drow, dcol ) {
        var difRow = Math.abs( fig.row - drow )
        var difCol = Math.abs( fig.col - dcol )
        if (difRow > 1 || difCol > 1) {
            return false
        }

        return this.checkAndTakeOver(fig, drow, dcol)
    }

    this.isMovePossible = function( fig, row, col ) {
        var figColor = fig.kind[0]
        var figType  = fig.kind[1]

        switch(figType) {
        case "p":
            return this.handlePawn(fig, row, col)
        case "r":
            return this.handleRook(fig, row, col)
        case "h":
            return this.handleKnight(fig, row, col)
        case "b":
            return this.handleBishop(fig, row, col)
        case "q":
            return this.handleQueen(fig, row, col)
        case "k":
            return this.handleKing(fig, row, col)
        default:
            return false
        }
    }

    this.handleMove = function (mouse) {
        var rc = this.coordsToRowCol(mouse.x, mouse.y)

        //Handle the case where we give up on the selected figure
        if ( this.selectedFig.row == rc[0] && this.selectedFig.col == rc[1] ) {
            //should be our cur figure. Unselect it
            this.selectedFig.opacity = 1.0
            this.selectedFig = null
            // don't switch turns just return
            return
        }

        if ( this.isMovePossible(this.selectedFig, rc[0], rc[1]) == false ) {
            return
        }

        this.putFigAt(this.selectedFig, rc[0], rc[1])

        this.selectedFig.opacity = 1.0
        this.selectedFig = null

        this.changeTurn()
        this.pushHistoryState()
    }

    // Handle click event from the mouse
    this.clicked = function(mouse) {
        if (this.selectedFig == null) {
            this.handleSelection(mouse)
        } else {
            this.handleMove(mouse)
        }
    }
}


// Instance of the Chess game
var game = new Chess( )



function createFigures() {

    var figHndlr = new FigureHolder()

    if (FigCmp == null) {
        FigCmp = Qt.createComponent("Figure.qml");
    }

    if (FigCmp.status == Quick.Component.Ready) {
        var obj;

        //Create blacks
        //pawns
        for(var i=0; i<8; i++) {
            // make a new object inside the [body] id
            obj = FigCmp.createObject( body )

            obj.kind   = "bp"
            obj.visible = false
            figHndlr.put(obj)
        }

        // rooks
        obj = FigCmp.createObject( body )
        obj.kind   = "br"; obj.visible = false
        figHndlr.put(obj)

        obj = FigCmp.createObject( body )
        obj.kind   = "br"; obj.visible = false
        figHndlr.put(obj)

        // knights - horses in this abreviation
        obj = FigCmp.createObject( body )
        obj.kind   = "bh"; obj.visible = false
        figHndlr.put(obj)

        obj = FigCmp.createObject( body )
        obj.kind   = "bh"; obj.visible = false
        figHndlr.put(obj)

        // bishops
        obj = FigCmp.createObject( body )
        obj.kind   = "bb"; obj.visible = false
        figHndlr.put(obj)

        obj = FigCmp.createObject( body )
        obj.kind   = "bb"; obj.visible = false
        figHndlr.put(obj)

        // king and queen
        obj = FigCmp.createObject( body )
        obj.kind   = "bq"; obj.visible = false
        figHndlr.put(obj)

        obj = FigCmp.createObject( body )
        obj.kind   = "bk"; obj.visible = false
        figHndlr.put(obj)

        // Create whites
        //pawns
        for(var i=0; i<8; i++) {
            // make a new object inside the [body] id
            obj = FigCmp.createObject( body )
            obj.kind   = "wp"; obj.visible = false
            figHndlr.put(obj)
        }

        // rooks
        obj = FigCmp.createObject( body )
        obj.kind   = "wr"; obj.visible = false
        figHndlr.put(obj)

        obj = FigCmp.createObject( body )
        obj.kind   = "wr"; obj.visible = false
        figHndlr.put(obj)

        // knights - horses in this abreviation
        obj = FigCmp.createObject( body )
        obj.kind   = "wh"; obj.visible = false
        figHndlr.put(obj)

        obj = FigCmp.createObject( body )
        obj.kind   = "wh"; obj.visible = false
        figHndlr.put(obj)

        // bishops
        obj = FigCmp.createObject( body )
        obj.kind   = "wb"; obj.visible = false
        figHndlr.put(obj)

        obj = FigCmp.createObject( body )
        obj.kind   = "wb"; obj.visible = false
        figHndlr.put(obj)

        // king and queen
        obj = FigCmp.createObject( body )
        obj.kind   = "wq"; obj.visible = false
        figHndlr.put(obj)

        obj = FigCmp.createObject( body )
        obj.kind   = "wk"; obj.visible = false
        figHndlr.put(obj)
    }

    return figHndlr
}
