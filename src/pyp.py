import os
import sys

def collect_files_content(directory, output_file, exclude_dirs=None, exclude_extensions=None):
    """
    Рекурсивно собирает содержимое всех файлов в директории и записывает в выходной файл.
    
    Args:
        directory (str): Путь к директории для сканирования
        output_file (str): Путь к выходному текстовому файлу
        exclude_dirs (list): Список названий папок для исключения
        exclude_extensions (list): Список расширений файлов для исключения (например, ['.pyc', '.log'])
    """
    
    if exclude_dirs is None:
        exclude_dirs = ['.git', '__pycache__', 'node_modules', 'venv', 'env', '.venv']
    
    if exclude_extensions is None:
        exclude_extensions = ['.pyc', '.pyo', '.pyd', '.so', '.dll', '.dylib', '.exe', '.bin']
    
    # Счетчики для статистики
    total_files = 0
    total_skipped = 0
    
    # Открываем выходной файл для записи
    with open(output_file, 'w', encoding='utf-8') as out_f:
        # Проходим по всем файлам и папкам рекурсивно
        for root, dirs, files in os.walk(directory):
            # Фильтруем папки для исключения (модифицируем список dirs на месте)
            dirs[:] = [d for d in dirs if d not in exclude_dirs]
            
            # Сортируем файлы для упорядоченного вывода
            files.sort()
            
            for file in files:
                file_path = os.path.join(root, file)
                relative_path = os.path.relpath(file_path, directory)
                
                # Проверяем расширение файла
                _, ext = os.path.splitext(file)
                if ext.lower() in exclude_extensions:
                    total_skipped += 1
                    continue
                
                try:
                    # Пытаемся прочитать файл с различными кодировками
                    content = None
                    for encoding in ['utf-8', 'cp1251', 'latin-1', 'utf-16']:
                        try:
                            with open(file_path, 'r', encoding=encoding) as f:
                                content = f.read()
                            break
                        except UnicodeDecodeError:
                            continue
                        except Exception:
                            break
                    
                    if content is None:
                        # Если не удалось прочитать как текст, пробуем прочитать как бинарный
                        try:
                            with open(file_path, 'rb') as f:
                                binary_content = f.read(1024)  # Читаем первые 1024 байта
                                # Проверяем, содержит ли файл нулевые байты (бинарный)
                                if b'\x00' in binary_content:
                                    content = f"[Бинарный файл - пропущен]"
                                else:
                                    content = f"[Невозможно прочитать содержимое]"
                        except Exception:
                            content = f"[Ошибка чтения файла]"
                    
                    # Записываем информацию о файле
                    out_f.write(f"{'='*80}\n")
                    out_f.write(f"Файл: {relative_path}\n")
                    out_f.write(f"{'='*80}\n\n")
                    out_f.write(content)
                    out_f.write(f"\n\n")
                    
                    total_files += 1
                    
                except Exception as e:
                    out_f.write(f"{'='*80}\n")
                    out_f.write(f"Файл: {relative_path}\n")
                    out_f.write(f"{'='*80}\n\n")
                    out_f.write(f"[Ошибка при обработке файла: {str(e)}]\n\n")
                    total_skipped += 1
    
    return total_files, total_skipped

def main():
    # Получаем путь к директории
    if len(sys.argv) > 1:
        directory = sys.argv[1]
    else:
        directory = os.getcwd()  # Текущая директория по умолчанию
    
    if len(sys.argv) > 2:
        output_file = sys.argv[2]
    else:
        output_file = os.path.join(directory, 'contents.txt')
    
    print(f"Сканирование директории: {directory}")
    print(f"Выходной файл: {output_file}")
    print("-" * 50)
    
    try:
        total_files, total_skipped = collect_files_content(directory, output_file)
        print(f"✓ Готово!")
        print(f"  Обработано файлов: {total_files}")
        print(f"  Пропущено файлов: {total_skipped}")
        print(f"  Результат сохранен в: {output_file}")
    except Exception as e:
        print(f"❌ Ошибка: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()