import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedTestTasks() {
  console.log('🌱 Додаємо 20 тестових завдань...');

  const testTasks = [
    {
      title: 'Прибрати парк на вул. Головна',
      description: 'Потрібно прибрати паркову територію. Забрати листя, гілки, різне сміття. Час: 2 години',
      type: 'VOLUNTEER',
      status: 'OPEN',
      reward: 25.0,
      city: 'Львів',
      district: 'Залізничний',
      location: 'Парк на вул. Головна, 10'
    },
    {
      title: 'Розвіз листівок по райому',
      description: 'Розвіз рекламних листівок по мешканцям вулиці. Близько 100 листівок.',
      type: 'WORK',
      status: 'OPEN',
      reward: 40.0,
      city: 'Львів',
      district: 'Франківський',
      location: 'вул. Лисенка, 1-50'
    },
    {
      title: 'Помощь в організації спортивного турніру',
      description: 'Допомога в підготовці та проведенні турніру з волейболу. Реєстрація учасників, облік рахунків.',
      type: 'VOLUNTEER',
      status: 'OPEN',
      reward: 50.0,
      city: 'Львів',
      district: 'Личаківський',
      location: 'Спортзал ЗОШ #1'
    },
    {
      title: 'Перенести меблі в дитячий садок',
      description: 'Перенести легкі меблі (полиці, столи) з одного приміщення в друге. 3-4 людини',
      type: 'WORK',
      status: 'OPEN',
      reward: 35.0,
      city: 'Львів',
      district: 'Залізничний',
      location: 'Дитячий садок №5, вул. Татарів 12'
    },
    {
      title: 'Фотографування місцевих пам\'яток',
      description: 'Сфотографувати історичні місця міста для архіву. Мінімум 50 якісних фото.',
      type: 'VOLUNTEER',
      status: 'OPEN',
      reward: 60.0,
      city: 'Львів',
      district: 'Центр',
      location: 'Історичний центр Львова'
    },
    {
      title: 'Прибирання подвір\'я при школі',
      description: 'Прибрати та впорядкувати подвір\'я школи. Полити рослини, забрати листя.',
      type: 'VOLUNTEER',
      status: 'OPEN',
      reward: 30.0,
      city: 'Львів',
      district: 'Шевченківський',
      location: 'ЗОШ №42'
    },
    {
      title: 'Допомога в біблліотеці',
      description: 'Упорядкування книг на полицях, каталогізація нових надходжень.',
      type: 'VOLUNTEER',
      status: 'OPEN',
      reward: 25.0,
      city: 'Львів',
      district: 'Личаківський',
      location: 'Міська публічна бібліотека'
    },
    {
      title: 'Розклеювання соціальних оголошень',
      description: 'Розклеїти інформаційні оголошення про здоровий спосіб життя. 50 оголошень',
      type: 'WORK',
      status: 'OPEN',
      reward: 45.0,
      city: 'Львів',
      district: 'Франківський',
      location: 'Громадські місця вулиці Коперника'
    },
    {
      title: 'Влаштування на полиці з книжками',
      description: 'Допомога в бібліотеці при впорядкуванні нової колекції книг',
      type: 'VOLUNTEER',
      status: 'OPEN',
      reward: 20.0,
      city: 'Львів',
      district: 'Залізничний',
      location: 'Бібліотека районну №7'
    },
    {
      title: 'Упорядкування спортивного залу',
      description: 'Чищення та впорядкування спортивного обладнання в залі',
      type: 'WORK',
      status: 'OPEN',
      reward: 35.0,
      city: 'Львів',
      district: 'Личаківський',
      location: 'Спортклуб "Чемпіон"'
    },
    {
      title: 'Тестування мобільного додатку',
      description: 'Протестувати новий версію додатку для управління завданнями',
      type: 'WORK',
      status: 'OPEN',
      reward: 55.0,
      city: 'Львів',
      district: 'Центр',
      location: 'Офіс IT компанії'
    },
    {
      title: 'Організація виставки малюнків',
      description: 'Допомога в організації виставки дитячих малюнків у центрі мистецтва',
      type: 'VOLUNTEER',
      status: 'OPEN',
      reward: 40.0,
      city: 'Львів',
      district: 'Личаківський',
      location: 'Центр сучасного мистецтва'
    },
    {
      title: 'Охорона під час святкування',
      description: 'Забезпечення безпеки і контролю на святковому заході',
      type: 'WORK',
      status: 'OPEN',
      reward: 50.0,
      city: 'Львів',
      district: 'Франківський',
      location: 'Палац культури та мистецтв'
    },
    {
      title: 'Збір донорської крові',
      description: 'Допомога в організації дня донорства крові. Реєстрація учасників.',
      type: 'VOLUNTEER',
      status: 'OPEN',
      reward: 35.0,
      city: 'Львів',
      district: 'Залізничний',
      location: 'Станція переливання крові'
    },
    {
      title: 'Впорядкування парку для людей з інвалідністю',
      description: 'Упорядкування доступних доріжок та облаштування в парку',
      type: 'VOLUNTEER',
      status: 'OPEN',
      reward: 45.0,
      city: 'Львів',
      district: 'Шевченківський',
      location: 'Парк "Стрийський"'
    },
    {
      title: 'Чищення потоків і дренажу',
      description: 'Чищення дренажних систем від сміття та листя у парковій зоні',
      type: 'WORK',
      status: 'OPEN',
      reward: 40.0,
      city: 'Львів',
      district: 'Залізничний',
      location: 'Парк "Зелені легені"'
    },
    {
      title: 'Розповсюджування інформації про вакцинацію',
      description: 'Розповсюджування буклетів та інформації про вакцинацію в громаді',
      type: 'VOLUNTEER',
      status: 'OPEN',
      reward: 25.0,
      city: 'Львів',
      district: 'Личаківський',
      location: 'Райовна поліклініка №3'
    },
    {
      title: 'Навчання комп\'ютерної грамотності для старших',
      description: 'Проведення простих занять для пенсіонерів щодо роботи на ПК',
      type: 'VOLUNTEER',
      status: 'OPEN',
      reward: 50.0,
      city: 'Львів',
      district: 'Центр',
      location: 'Будинок культури "Світанок"'
    },
    {
      title: 'Видалення графіті з стін',
      description: 'Видалення небажаного графіті зі стін на вулиці Вірменської',
      type: 'WORK',
      status: 'OPEN',
      reward: 45.0,
      city: 'Львів',
      district: 'Франківський',
      location: 'вул. Вірменська, 20-80'
    },
    {
      title: 'Розбирання старого граду в парку',
      description: 'Допомога в розбиранні старого граду в парковій зоні',
      type: 'WORK',
      status: 'OPEN',
      reward: 55.0,
      city: 'Львів',
      district: 'Личаківський',
      location: 'Парк "Клименко"'
    }
  ];

  let created = 0;

  for (const taskData of testTasks) {
    try {
      const task = await prisma.quest.create({
        data: taskData,
      });
      console.log(`✅ Завдання ${++created}: "${task.title}"`);
    } catch (error) {
      console.error(`❌ Помилка при додаванні: ${taskData.title}`, error);
    }
  }

  console.log(`\n🎉 Додано ${created} тестових завдань!`);
  
  // Показуємо статистику
  const total = await prisma.quest.count();
  console.log(`📊 Всього завдань в системі: ${total}`);
}

seedTestTasks()
  .catch((error) => {
    console.error('Помилка:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
