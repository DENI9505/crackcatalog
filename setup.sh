#!/usr/bin/env bash
# Запуск: bash setup.sh
# Ставит зависимости, собирает проект и запускает сервер — один шаг вместо пяти.
set -e

echo "== Устанавливаю зависимости =="
npm install

echo "== Собираю проект =="
npm run build

echo ""
echo "== Готово =="
echo "Каталог лежит в: catalog-data/catalog.json"
echo "Файлы приложений кладите в: catalog-data/files/"
echo ""
echo "Запускаю сервер на http://localhost:8081 ..."
echo "(Чтобы остановить — Ctrl+C. Чтобы запускать потом без этого скрипта: npm start)"
echo ""
npm start
