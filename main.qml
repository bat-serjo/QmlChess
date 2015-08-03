import QtQuick 2.4
import QtQuick.Controls 1.3
import QtQuick.Window 2.2
import QtQuick.Dialogs 1.2
import QtQuick.Layouts 1.1
import QmlFileIO 1.0
import "Logic.js" as Logic

ApplicationWindow {
    title: qsTr("QChess")
    width:  600
    height: 600
    visible: true

    QmlFileIO {
        id: fio
    }

    toolBar: ToolBar {
        RowLayout {
            anchors.centerIn: parent
            ToolButton {
                id: bStart
                text: qsTr("Start")
                visible: true
                onClicked: {
                    body.state = "PLAY"
                    Logic.game.initialPosition()
                }
            }

            ToolButton {
                id: bLoad
                text: qsTr("Load")
                visible: true
                onClicked: {
                    fileDialog.load = true

                    fileDialog.title = "Load saved game."
                    fileDialog.selectExisting = true
                    fileDialog.open()
                    body.state = "LOAD"
                }
            }

            ToolButton {
                id: bStop
                text: qsTr("Stop")
                visible: false
                onClicked: {
                    body.state = "INITIAL"
                }
            }

            ToolButton {
                id: bSave
                text: qsTr("Save")
                visible: false
                onClicked: {
                    fileDialog.load = false

                    fileDialog.title = "Save game as."
                    fileDialog.selectExisting = false
                    fileDialog.open()
                }
            }

            ToolButton {
                id: bPrev
                text: qsTr("Prev")
                visible: false
                onClicked: {
                    Logic.game.histPrev()
                }
            }

            ToolButton {
                id: bNext
                text: qsTr("Next")
                visible: false
                onClicked: {
                    Logic.game.histNext()
                }
            }
        }
    }

    Item {
        id: body
        visible: true
        anchors.fill: parent
        state: "INITIAL"

        property int blockSizeX: { return Math.floor(body.width/8.0) }
        property int blockSizeY: { return Math.floor(body.height/8.0) }

        Image{
            source: "images/board/simple.svg"
            anchors.fill: parent
            visible: true
        }

        states: [
            State {
                name: "INITIAL"
                PropertyChanges { target: bStart; visible: true  }
                PropertyChanges { target: bLoad;  visible: true  }
                PropertyChanges { target: bStop;  visible: false }
                PropertyChanges { target: bSave;  visible: false }
                PropertyChanges { target: bPrev;  visible: false }
                PropertyChanges { target: bNext;  visible: false }
            },

            State {
                name: "PLAY"
                PropertyChanges { target: bStart; visible: false }
                PropertyChanges { target: bLoad;  visible: false }
                PropertyChanges { target: bStop;  visible: true  }
                PropertyChanges { target: bSave;  visible: true  }
                PropertyChanges { target: bPrev;  visible: false }
                PropertyChanges { target: bNext;  visible: false }
            },

            State {
                name: "LOAD"
                PropertyChanges { target: bStart; visible: true  }
                PropertyChanges { target: bLoad;  visible: true  }
                PropertyChanges { target: bStop;  visible: false }
                PropertyChanges { target: bSave;  visible: false }
                PropertyChanges { target: bPrev;  visible: true  }
                PropertyChanges { target: bNext;  visible: true  }
            }
        ]


        MouseArea {
            anchors.fill: parent
            onClicked: {
                if (body.state == "PLAY") {
                    Logic.game.clicked(mouse)
                }
            }
        }

    }


    FileDialog {
        id: fileDialog
        visible: false
        modality: Qt.WindowModal
        title: "Save game as!"

        selectExisting: true
        selectMultiple: false
        selectFolder: false
        sidebarVisible: true

        nameFilters: [ "*.qchess *.*" ]
        selectedNameFilter: ""

        property bool load: false

        onAccepted: {
            var path = fileUrl.toString().split("://")
            if (load == true) {
                Logic.game.loadGame(path[1])
            } else {
                Logic.game.saveGame(path[1])
            }
        }
    }

}
