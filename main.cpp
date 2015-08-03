#include <QtQml>
#include <QApplication>
#include <QQmlApplicationEngine>

#include <qmlfileio.h>

int main(int argc, char *argv[])
{
    QApplication app(argc, argv);

    qmlRegisterType<QmlFileIO> ("QmlFileIO", 1, 0, "QmlFileIO");

    QQmlApplicationEngine engine;
    engine.load(QUrl(QStringLiteral("qrc:/main.qml")));

    return app.exec();
}
