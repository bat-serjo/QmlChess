#include <qmlfileio.h>
#include <QtDebug>

QmlFileIO::QmlFileIO(QObject *parent) : QObject(parent) {

}

QString QmlFileIO::source() {
    return mSource;
}

void QmlFileIO::setSource(const QString& source) {
    mSource = source;
}

QString QmlFileIO::read()
{
    if ( mSource.isEmpty() == true ) {
        emit error("source is empty");
        return QString();
    }

    QFile file(mSource);
    QString fileContent;

    if ( file.open(QIODevice::ReadOnly) ) {
        QTextStream t( &file );
        fileContent = t.readAll();
        file.close();
    } else {
        emit error("Unable to open the file");
        return QString();
    }

    return fileContent;
}

bool QmlFileIO::write(const QString& data)
{
    if (mSource.isEmpty())
        return false;

    QFile file;
    file.setFileName(mSource);

    if (!file.open(QIODevice::WriteOnly| QIODevice::Truncate))
        return false;

    QTextStream fs(&file);
    fs << data;
    fs.flush();

    file.close();
    return true;
}

