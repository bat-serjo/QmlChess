TEMPLATE = app

QT += core qml quick widgets

SOURCES += main.cpp \
    qmlfileio.cpp

RESOURCES += qml.qrc

# Additional import path used to resolve QML modules in Qt Creator's code model
QML_IMPORT_PATH =

# Default rules for deployment.
include(deployment.pri)

DISTFILES +=

HEADERS += \
    qmlfileio.h
