#ifndef QMLFILEIO_H
#define QMLFILEIO_H
#include <QFile>
#include <QObject>
#include <QTextStream>


class QmlFileIO : public QObject
{
    Q_OBJECT

private:
    QString mSource;

public:
    Q_PROPERTY(QString source
               READ source
               WRITE setSource
               NOTIFY sourceChanged)
    explicit QmlFileIO(QObject *parent = 0);

    Q_INVOKABLE QString read();
    Q_INVOKABLE bool write(const QString& data);
    QString source();

public slots:
    void setSource(const QString& source);

signals:
    void sourceChanged(const QString& source);
    void error(const QString& msg);
};


#endif // QMLFILEIO_H

