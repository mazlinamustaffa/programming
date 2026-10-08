export const parts = [
  {
    id: 'notes',
    label: 'Notes',
  },
  {
    id: 'exercise',
    label: 'Exercise',
  },
  {
    id: 'practical',
    label: 'Practical',
  },
  {
    id: 'quiz',
    label: 'Quiz',
  },
  {
    id: 'test',
    label: 'Test',
  },
]

export const topics = [
  {
    id: 'intro',
    number: 1,
    title: 'Introduction & Algorithms',
    shortTitle: 'Introduction',
    description:
      'Turn everyday problems into clear instructions a computer can follow.',
    color: 'orange',
    icon: 'Compass',
    duration: '35 min',
    level: 'Beginner',
    parts: {
      notes: {
        overview:
          'Programming means expressing a solution as precise instructions. C++ is a compiled language: a compiler translates your source code into a program that can run. Every example here starts execution in main().',
        objectives: [
          'Explain programs, algorithms, and the compile/run cycle.',
          'Recognize input, processing, and output.',
          'Trace a short C++ program from top to bottom.',
        ],
        sections: [
          {
            title: 'Start with an algorithm',
            body: 'An algorithm is a finite sequence of clear steps for solving a problem. Before writing code, describe the steps in ordinary language or pseudocode. For a shopping total: store the price, store the quantity, multiply them, then display the result.',
            code: '// Algorithm: calculate the cost of two notebooks.\n// 1. Store the notebook price.\n// 2. Store the quantity.\n// 3. Multiply price by quantity.\n// 4. Display the total.',
          },
          {
            title: 'Input → process → output',
            body: 'Input is the data your program starts with. Processing changes or combines that data. Output communicates the result. These examples use fixed values as inputs. cout sends text and numbers to the console; endl finishes a line.',
            code: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int price = 8;       // Input\n    int quantity = 2;    // Input\n    int total = price * quantity; // Process\n    cout << total << endl; // Output: 16\n    return 0;\n}',
          },
          {
            title: 'Understand a C++ program',
            body: '#include <iostream> provides console input and output. using namespace std lets our beginner examples write cout instead of std::cout. The statements inside main execute in order. Most statements end in a semicolon. // starts a comment; return 0 indicates successful completion.',
            code: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Plan the solution" << endl;\n    cout << "Write the code" << endl;\n    cout << "Check the result" << endl;\n    return 0;\n}',
          },
        ],
        takeaways: [
          'A good algorithm has clear steps and a stopping point.',
          'Identify inputs, processing, and expected output before coding.',
          'C++ programs are compiled and start executing in main().',
        ],
      },
      exercise: {
        title: 'Your first calculation',
        prompt:
          'A student buys 3 notebooks at RM 6 each. Store the price and quantity, calculate their product, then print "Total: RM 18". Keep the steps in the correct order.',
        starter:
          '#include <iostream>\nusing namespace std;\n\nint main() {\n    int price = 6;\n    int quantity = 3;\n    // TODO: replace 0 with the calculation.\n    int total = 0;\n    cout << "Total: RM " << total << endl;\n    return 0;\n}',
        solution:
          '#include <iostream>\nusing namespace std;\n\nint main() {\n    int price = 6;\n    int quantity = 3;\n    int total = price * quantity;\n    cout << "Total: RM " << total << endl;\n    return 0;\n}',
        explanation:
          'The inputs are 6 and 3. Multiplication produces 18. The insertion operator << sends the text and total to cout in order.',
        expectedOutput: 'Total: RM 18',
      },
      practical: {
        title: 'Build a study-time planner',
        prompt:
          'You plan 4 study sessions, each lasting 25 minutes. Store both inputs, calculate totalMinutes, and print the messages in the expected output.',
        starter:
          '#include <iostream>\nusing namespace std;\n\nint main() {\n    int sessions = 4;\n    int minutesPerSession = 25;\n    // TODO: calculate totalMinutes.\n    int totalMinutes = 0;\n    cout << "Sessions: " << sessions << endl;\n    // TODO: print the total study time.\n    return 0;\n}',
        solution:
          '#include <iostream>\nusing namespace std;\n\nint main() {\n    int sessions = 4;\n    int minutesPerSession = 25;\n    int totalMinutes = sessions * minutesPerSession;\n    cout << "Sessions: " << sessions << endl;\n    cout << "Total study time: " << totalMinutes << " minutes" << endl;\n    return 0;\n}',
        expectedOutput: 'Sessions: 4\nTotal study time: 100 minutes',
      },
      quiz: [
        {
          id: 'intro-q1',
          question: 'Which description best defines an algorithm?',
          options: [
            'A list of random guesses',
            'A finite sequence of clear steps to solve a problem',
            'Only the final answer',
            'A brand of computer',
          ],
          answer: 1,
          explanation:
            'An algorithm describes the steps needed to solve a problem and reaches an end.',
        },
        {
          id: 'intro-q2',
          question:
            'In int total = price * quantity;, what does multiplication represent?',
          options: ['Output', 'A comment', 'Processing', 'An error'],
          answer: 2,
          explanation: 'Processing transforms the input values into a result.',
        },
        {
          id: 'intro-q3',
          question: 'What does cout << "Hello" << endl; do?',
          options: [
            'Displays Hello and ends the line',
            'Asks the user to type Hello',
            'Creates a variable called Hello',
            'Stops the program permanently',
          ],
          answer: 0,
          explanation:
            'cout displays output; endl inserts a newline and flushes the output stream.',
        },
      ],
      test: [
        {
          id: 'intro-t1',
          question:
            'Where does a standard C++ console program begin executing?',
          options: [
            'The last line',
            'Any function chosen at random',
            'The first comment',
            'The main function',
          ],
          answer: 3,
          explanation:
            'The main function is the entry point of a standard C++ console program.',
        },
        {
          id: 'intro-t2',
          question: 'Which line is a C++ single-line comment?',
          options: [
            '// Calculate the total',
            'print the total',
            '<!-- Calculate the total -->',
            '# Calculate the total',
          ],
          answer: 0,
          explanation:
            '// begins a single-line C++ comment. Text after it is not executed.',
        },
        {
          id: 'intro-t3',
          question:
            'A program starts with distance and travel time, calculates speed, and displays it. Which values are inputs?',
          options: [
            'Only the displayed speed',
            'Only the division operator',
            'Distance and travel time',
            'The console itself',
          ],
          answer: 2,
          explanation:
            'Distance and travel time are the starting data. Speed is the processed result.',
        },
      ],
    },
  },
  {
    id: 'variables',
    number: 2,
    title: 'Variables & Data Types',
    shortTitle: 'Variables & Types',
    description:
      'Store information with meaningful names and choose the right data type.',
    color: 'purple',
    icon: 'Boxes',
    duration: '40 min',
    level: 'Beginner',
    parts: {
      notes: {
        overview:
          'A variable is a named storage location with a declared type. C++ types tell the compiler what kind of value a variable can hold. Good names make a program easier to understand.',
        objectives: [
          'Declare and update typed variables.',
          'Distinguish int, double, char, and bool.',
          'Use constants and display text stored in character arrays.',
        ],
        sections: [
          {
            title: 'Declare a type and a name',
            body: 'A declaration gives a variable a type, a name, and often an initial value. int stores whole numbers and double stores floating-point numbers. Variable names are case-sensitive. Use descriptive names such as completedLessons and initialize values before using them.',
            code: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int completedLessons = 2;\n    double studyHours = 1.5;\n    completedLessons = 3;\n    cout << completedLessons << endl; // 3\n    cout << studyHours << endl;       // 1.5\n    return 0;\n}',
          },
          {
            title: 'Characters, booleans, and text',
            body: 'char holds one character in single quotes. bool holds true or false; cout displays them as 1 and 0 by default. A character array can store a text literal in double quotes and a terminating null character. Our browser lab uses character arrays for text.',
            code: '#include <iostream>\nusing namespace std;\n\nint main() {\n    char grade = \'A\';\n    bool isEnrolled = true;\n    char studentName[] = "Aina";\n    cout << grade << endl;       // A\n    cout << isEnrolled << endl;  // 1\n    cout << studentName << endl; // Aina\n    return 0;\n}',
          },
          {
            title: 'Protect a value with const',
            body: 'Add const when a value must not change after initialization. Unlike a variable, a const value cannot be assigned a new value later. Compose readable output by chaining << between text literals and values. "19" is text; 19 is a number.',
            code: '#include <iostream>\nusing namespace std;\n\nint main() {\n    const int courseCredits = 3;\n    const char courseName[] = "Programming Fundamentals";\n    cout << courseName << ": " << courseCredits << " credits" << endl;\n    return 0;\n}',
          },
        ],
        takeaways: [
          'Declare the type and initialize each variable before use.',
          'Single quotes represent a character; double quotes represent text.',
          'Use const for values that should not change.',
        ],
      },
      exercise: {
        title: 'Introduce a learner',
        prompt:
          'Store "Aina" in a character array named studentName, 19 in an int named age, and true in a bool named isEnrolled. Print the introduction and enrollment flag. Boolean true displays as 1 by default.',
        starter:
          '#include <iostream>\nusing namespace std;\n\nint main() {\n    char studentName[] = "";\n    int age = 0;\n    bool isEnrolled = false;\n    // TODO: set the values above correctly.\n    cout << studentName << " is " << age << " years old." << endl;\n    cout << "Enrolled: " << isEnrolled << endl;\n    return 0;\n}',
        solution:
          '#include <iostream>\nusing namespace std;\n\nint main() {\n    char studentName[] = "Aina";\n    int age = 19;\n    bool isEnrolled = true;\n    cout << studentName << " is " << age << " years old." << endl;\n    cout << "Enrolled: " << isEnrolled << endl;\n    return 0;\n}',
        explanation:
          'The name is text stored as characters. age is a whole number. isEnrolled is a boolean, so cout prints 1 for true.',
        expectedOutput: 'Aina is 19 years old.\nEnrolled: 1',
      },
      practical: {
        title: 'Create a student profile',
        prompt:
          'Use const character arrays for "Daniel" and "Programming Fundamentals". Start completedLessons at 2, then update it to 3. Set a bool isActive to true. Print the profile below; true is shown as 1.',
        starter:
          '#include <iostream>\nusing namespace std;\n\nint main() {\n    const char studentName[] = "Daniel";\n    const char course[] = "Programming Fundamentals";\n    int completedLessons = 2;\n    bool isActive = true;\n    // TODO: update completedLessons and print the profile.\n    return 0;\n}',
        solution:
          '#include <iostream>\nusing namespace std;\n\nint main() {\n    const char studentName[] = "Daniel";\n    const char course[] = "Programming Fundamentals";\n    int completedLessons = 2;\n    bool isActive = true;\n    completedLessons = 3;\n    cout << "Student: " << studentName << endl;\n    cout << "Course: " << course << endl;\n    cout << "Lessons completed: " << completedLessons << endl;\n    cout << "Active: " << isActive << endl;\n    return 0;\n}',
        expectedOutput:
          'Student: Daniel\nCourse: Programming Fundamentals\nLessons completed: 3\nActive: 1',
      },
      quiz: [
        {
          id: 'variables-q1',
          question: 'Which type is suitable for a score of 87?',
          options: ['char', 'bool', 'int', 'void'],
          answer: 2,
          explanation: 'int stores whole numbers such as 87.',
        },
        {
          id: 'variables-q2',
          question:
            'Which declaration stores a decimal value without truncating its fractional part?',
          options: [
            'int hours = 1.5;',
            'double hours = 1.5;',
            'char hours = 1.5;',
            'bool hours = 1.5;',
          ],
          answer: 1,
          explanation: 'double represents floating-point values such as 1.5.',
        },
        {
          id: 'variables-q3',
          question: 'What does cout << true; display by default?',
          options: ['1', 'true', '0', 'Nothing'],
          answer: 0,
          explanation:
            'The default numeric format prints true as 1 and false as 0.',
        },
      ],
      test: [
        {
          id: 'variables-t1',
          question: 'Which declaration correctly stores a single character?',
          options: [
            'char grade = "A";',
            'int grade = "A";',
            'bool grade = "A";',
            "char grade = 'A';",
          ],
          answer: 3,
          explanation:
            'A char literal uses single quotes. A double-quoted literal is an array of characters.',
        },
        {
          id: 'variables-t2',
          question:
            'After const int credits = 3;, what happens if you write credits = 4;?',
          options: [
            'credits becomes 4',
            'The compiler rejects assignment to the constant',
            'credits becomes 0',
            'The assignment creates a new variable',
          ],
          answer: 1,
          explanation:
            'A const value cannot be reassigned after initialization.',
        },
        {
          id: 'variables-t3',
          question: 'Which declaration stores a boolean?',
          options: [
            'int active = 1;',
            "char active = 'Y';",
            'bool active = true;',
            'double active = 1.0;',
          ],
          answer: 2,
          explanation:
            'bool stores true or false. The other declarations have different types.',
        },
      ],
    },
  },
  {
    id: 'operators',
    number: 3,
    title: 'Operators & Expressions',
    shortTitle: 'Operators',
    description:
      'Calculate results, compare values, and combine conditions with confidence.',
    color: 'blue',
    icon: 'Calculator',
    duration: '45 min',
    level: 'Beginner',
    parts: {
      notes: {
        overview:
          'An expression combines values and operators to produce a result. Arithmetic expressions calculate numbers, while comparisons and logical expressions produce boolean results.',
        objectives: [
          'Use arithmetic operators and parentheses.',
          'Compare values with ==, !=, and relational operators.',
          'Combine conditions with &&, ||, and !.',
        ],
        sections: [
          {
            title: 'Calculate with arithmetic',
            body: 'Use + for addition, - for subtraction, * for multiplication, / for division, and % for integer remainder. Multiplication and division happen before addition and subtraction. Integer division discards the fractional part; use a floating-point operand when you need a decimal result.',
            code: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << 8 + 2 * 3 << endl;   // 14\n    cout << (8 + 2) * 3 << endl; // 30\n    cout << 10 % 3 << endl;      // 1\n    cout << 5 / 2 << endl;       // 2\n    cout << 5 / 2.0 << endl;     // 2.5\n    return 0;\n}',
          },
          {
            title: 'Compare values',
            body: 'Comparisons produce true or false. Use == to test equality and != to test inequality. >, <, >=, and <= compare values. A single = assigns a value; it does not check equality. The default cout format displays comparison results as 1 or 0.',
            code: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << (5 == 5) << endl; // 1\n    cout << (5 != 5) << endl; // 0\n    cout << (7 >= 7) << endl; // 1\n    cout << (3 < 4) << endl;  // 1\n    return 0;\n}',
          },
          {
            title: 'Combine conditions',
            body: '&& means both conditions must be true, || means at least one must be true, and ! reverses a boolean. Group comparisons clearly. These expressions describe rules such as passing a course or qualifying for a discount.',
            code: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int score = 72;\n    int attendance = 90;\n    bool hasPassed = score >= 50 && attendance >= 80;\n    cout << hasPassed << endl;  // 1\n    cout << !hasPassed << endl; // 0\n    return 0;\n}',
          },
        ],
        takeaways: [
          'Use parentheses to make a calculation’s order clear.',
          'Use == to compare and = to assign.',
          'Integer division drops the fractional part; logical operators combine conditions.',
        ],
      },
      exercise: {
        title: 'Calculate a discounted total',
        prompt:
          'A customer buys 4 items at RM 12 each and receives a RM 5 discount on the whole order. Calculate the final total and check whether it is at least RM 40. Print the results; a true flag displays as 1.',
        starter:
          '#include <iostream>\nusing namespace std;\n\nint main() {\n    int quantity = 4;\n    int unitPrice = 12;\n    int discount = 5;\n    // TODO: calculate the total after the discount.\n    int total = 0;\n    // TODO: compare total with 40.\n    bool qualifies = false;\n    cout << "Total: RM " << total << endl;\n    cout << "Qualifies: " << qualifies << endl;\n    return 0;\n}',
        solution:
          '#include <iostream>\nusing namespace std;\n\nint main() {\n    int quantity = 4;\n    int unitPrice = 12;\n    int discount = 5;\n    int total = quantity * unitPrice - discount;\n    bool qualifies = total >= 40;\n    cout << "Total: RM " << total << endl;\n    cout << "Qualifies: " << qualifies << endl;\n    return 0;\n}',
        explanation:
          'The subtotal is 4 × 12 = 48. Subtracting 5 leaves 43. Since 43 is at least 40, qualifies is true and prints as 1.',
        expectedOutput: 'Total: RM 43\nQualifies: 1',
      },
      practical: {
        title: 'Build a course eligibility checker',
        prompt:
          'Assessment scores are 80, 70, and 90. Calculate their average using a floating-point divisor. A certificate needs an average of at least 75 AND attendance of at least 80. Attendance is 85. Print the average and eligibility (1 for true, 0 for false).',
        starter:
          '#include <iostream>\nusing namespace std;\n\nint main() {\n    int firstScore = 80;\n    int secondScore = 70;\n    int thirdScore = 90;\n    int attendance = 85;\n    // TODO: calculate average with parentheses and a divisor of 3.0.\n    double average = 0;\n    // TODO: combine both eligibility conditions.\n    bool eligible = false;\n    cout << "Average: " << average << endl;\n    cout << "Certificate eligible: " << eligible << endl;\n    return 0;\n}',
        solution:
          '#include <iostream>\nusing namespace std;\n\nint main() {\n    int firstScore = 80;\n    int secondScore = 70;\n    int thirdScore = 90;\n    int attendance = 85;\n    double average = (firstScore + secondScore + thirdScore) / 3.0;\n    bool eligible = average >= 75 && attendance >= 80;\n    cout << "Average: " << average << endl;\n    cout << "Certificate eligible: " << eligible << endl;\n    return 0;\n}',
        expectedOutput: 'Average: 80\nCertificate eligible: 1',
      },
      quiz: [
        {
          id: 'operators-q1',
          question: 'What is the result of 2 + 3 * 4?',
          options: ['20', '24', '9', '14'],
          answer: 3,
          explanation:
            'Multiplication happens first: 3 × 4 = 12, then 2 + 12 = 14.',
        },
        {
          id: 'operators-q2',
          question: 'What does 10 % 4 evaluate to?',
          options: ['2', '2.5', '4', '0'],
          answer: 0,
          explanation: 'The integer remainder after dividing 10 by 4 is 2.',
        },
        {
          id: 'operators-q3',
          question: 'Which comparison is true?',
          options: ['5 != 5', 'false && true', '7 >= 7', '!true'],
          answer: 2,
          explanation:
            '7 equals 7, so the greater-than-or-equal comparison is true.',
        },
      ],
      test: [
        {
          id: 'operators-t1',
          question:
            'What is the C++ result of 5 / 2 when both operands are integers?',
          options: ['2.5', '2', '3', '0'],
          answer: 1,
          explanation:
            'Integer division discards the fractional part, so the result is 2.',
        },
        {
          id: 'operators-t2',
          question:
            'A discount needs isMember OR hasCoupon to be true. Which operator expresses this?',
          options: ['&&', '==', '!', '||'],
          answer: 3,
          explanation: '|| requires at least one of the conditions to be true.',
        },
        {
          id: 'operators-t3',
          question:
            'If score is 70 and attendance is 60, what is score >= 50 && attendance >= 80?',
          options: ['true', '70', 'false', '60'],
          answer: 2,
          explanation:
            'The first comparison is true, but the second is false. && requires both.',
        },
      ],
    },
  },
  {
    id: 'control',
    number: 4,
    title: 'Control Flow',
    shortTitle: 'Control Flow',
    description:
      'Guide your program with decisions, repetition, and useful stopping rules.',
    color: 'green',
    icon: 'GitBranch',
    duration: '50 min',
    level: 'Beginner',
    parts: {
      notes: {
        overview:
          'Control flow determines which statements execute and how often. Conditions select a path, and loops repeat a block of code while a rule remains true.',
        objectives: [
          'Select a path with if, else if, and else.',
          'Repeat known steps with a for loop.',
          'Trace loop conditions and prevent endless repetition.',
        ],
        sections: [
          {
            title: 'Make a decision',
            body: 'An if statement executes its block when its condition is true. else if checks another condition when earlier ones fail, and else handles the remaining cases. Put more restrictive conditions first when categories overlap.',
            code: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int score = 82;\n    if (score >= 80) {\n        cout << "Excellent" << endl;\n    } else if (score >= 50) {\n        cout << "Pass" << endl;\n    } else {\n        cout << "Try again" << endl;\n    }\n    return 0;\n}',
          },
          {
            title: 'Repeat with a for loop',
            body: 'A for loop has initialization, a continuation condition, and an update. Initialization runs once, the condition is checked before each iteration, and the update runs after each completed iteration. i++ increases i by one.',
            code: '#include <iostream>\nusing namespace std;\n\nint main() {\n    for (int i = 1; i <= 3; i++) {\n        cout << "Practice " << i << endl;\n    }\n    // Practice 1\n    // Practice 2\n    // Practice 3\n    return 0;\n}',
          },
          {
            title: 'Keep loops bounded',
            body: 'A while loop checks its condition before each iteration. Change the value involved in that condition so the loop can end. Trace small examples by hand: record the counter and output after every iteration.',
            code: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int remaining = 3;\n    while (remaining > 0) {\n        cout << remaining << endl;\n        remaining--;\n    }\n    cout << "Done" << endl;\n    return 0;\n}',
          },
        ],
        takeaways: [
          'Only the first matching branch in an if / else if chain executes.',
          'Choose clear boundaries and check the first and last iteration.',
          'Each loop needs a way to reach its stopping condition.',
        ],
      },
      exercise: {
        title: 'Classify an assessment score',
        prompt:
          'For a score of 76, print "Excellent" when it is at least 80, "Pass" when it is at least 50, and "Try again" otherwise. Try changing the score to 90 and 35 after your first run.',
        starter:
          '#include <iostream>\nusing namespace std;\n\nint main() {\n    int score = 76;\n    // TODO: use if, else if, and else to print the correct result.\n    return 0;\n}',
        solution:
          '#include <iostream>\nusing namespace std;\n\nint main() {\n    int score = 76;\n    if (score >= 80) {\n        cout << "Excellent" << endl;\n    } else if (score >= 50) {\n        cout << "Pass" << endl;\n    } else {\n        cout << "Try again" << endl;\n    }\n    return 0;\n}',
        explanation:
          '76 fails the first condition but meets the second, so the program prints Pass. Checking 80 first prevents excellent scores from being caught by the broader 50 condition.',
        expectedOutput: 'Pass',
      },
      practical: {
        title: 'Print a practice checklist',
        prompt:
          'Use a for loop to count from 1 through 5. The first 3 tasks are complete; the last 2 are pending. Use if / else inside the loop to print each task’s status.',
        starter:
          '#include <iostream>\nusing namespace std;\n\nint main() {\n    int completedTasks = 3;\n    // TODO: loop from 1 through 5.\n    // Print Complete when task <= completedTasks.\n    // Otherwise, print Pending.\n    return 0;\n}',
        solution:
          '#include <iostream>\nusing namespace std;\n\nint main() {\n    int completedTasks = 3;\n    for (int task = 1; task <= 5; task++) {\n        if (task <= completedTasks) {\n            cout << "Task " << task << ": Complete" << endl;\n        } else {\n            cout << "Task " << task << ": Pending" << endl;\n        }\n    }\n    return 0;\n}',
        expectedOutput:
          'Task 1: Complete\nTask 2: Complete\nTask 3: Complete\nTask 4: Pending\nTask 5: Pending',
      },
      quiz: [
        {
          id: 'control-q1',
          question:
            'When does the else block of an if / else statement execute?',
          options: [
            'Every time, after if',
            'When the if condition is false',
            'Only when the condition is true',
            'Only inside a loop',
          ],
          answer: 1,
          explanation:
            'else provides the alternate path when the if condition is false.',
        },
        {
          id: 'control-q2',
          question:
            'How many iterations does for (int i = 0; i < 3; i++) perform?',
          options: ['2', '4', '3', '0'],
          answer: 2,
          explanation:
            'The body executes for i equal to 0, 1, and 2. At 3, the condition is false.',
        },
        {
          id: 'control-q3',
          question: 'What does i++ do in a loop?',
          options: [
            'Increases i by one',
            'Doubles i',
            'Resets i to zero',
            'Stops the loop immediately',
          ],
          answer: 0,
          explanation: 'i++ increments the counter by one.',
        },
      ],
      test: [
        {
          id: 'control-t1',
          question:
            'What is printed by if (4 > 9) { cout << "A"; } else { cout << "B"; }?',
          options: ['A', 'A and B', 'Nothing', 'B'],
          answer: 3,
          explanation: '4 > 9 is false, so the else branch prints B.',
        },
        {
          id: 'control-t2',
          question:
            'A while loop starts with count = 0 and checks count < 3. Which statement helps it end after three iterations?',
          options: ['count--;', 'count++;', 'count = 0;', 'cout << count;'],
          answer: 1,
          explanation:
            'Incrementing count takes it to 3, where the continuation condition is false.',
        },
        {
          id: 'control-t3',
          question:
            'To print 1 through 4, which condition is correct when i starts at 1 and increases by one?',
          options: ['i < 4', 'i > 4', 'i <= 4', 'i == 0'],
          answer: 2,
          explanation: 'i <= 4 includes 4. i < 4 would stop after 3.',
        },
      ],
    },
  },
  {
    id: 'functions',
    number: 5,
    title: 'Functions & Arrays',
    shortTitle: 'Functions & Arrays',
    description:
      'Reuse your solutions and work with collections of related information.',
    color: 'pink',
    icon: 'Braces',
    duration: '55 min',
    level: 'Beginner',
    parts: {
      notes: {
        overview:
          'Functions package reusable operations. Arrays store a fixed-size ordered collection of values of the same type. Together, they help you write small programs that process several related items.',
        objectives: [
          'Define and call typed functions with parameters and return values.',
          'Read array elements with zero-based indexes.',
          'Pass an array and its count to a function that calculates a total.',
        ],
        sections: [
          {
            title: 'Write a reusable function',
            body: 'A function declaration gives a return type, a name, and typed parameters. Parameters are local names for inputs; arguments are the values supplied in a call. return sends a result back and ends the current function call. Define functions before main in these examples.',
            code: '#include <iostream>\nusing namespace std;\n\nint add(int a, int b) {\n    return a + b;\n}\n\nint main() {\n    int result = add(4, 6);\n    cout << result << endl; // 10\n    return 0;\n}',
          },
          {
            title: 'Store an ordered collection',
            body: 'A fixed-size array stores values of one type. Its size is chosen at declaration and cannot grow. The first element is at index 0, so an array of 3 items has valid indexes 0, 1, and 2. C++ does not automatically check these boundaries; accessing outside them is unsafe.',
            code: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int scores[3] = {75, 80, 85};\n    cout << scores[0] << endl; // 75\n    cout << scores[2] << endl; // 85\n    scores[1] = 90;\n    cout << scores[1] << endl; // 90\n    return 0;\n}',
          },
          {
            title: 'Pass a count with an array',
            body: 'An array parameter does not carry the number of elements, so pass a count separately. Loop from 0 while the index is less than the count. An accumulator begins at 0 for a sum. Keep calculations in a function and display the returned result in main.',
            code: '#include <iostream>\nusing namespace std;\n\nint sum(int numbers[], int count) {\n    int total = 0;\n    for (int i = 0; i < count; i++) {\n        total += numbers[i];\n    }\n    return total;\n}\n\nint main() {\n    int values[3] = {10, 20, 30};\n    cout << sum(values, 3) << endl; // 60\n    return 0;\n}',
          },
        ],
        takeaways: [
          'Typed parameters let functions work with different arguments.',
          'return produces a result; cout displays a value.',
          'Arrays start at index 0. Pass their count and stay within their bounds.',
        ],
      },
      exercise: {
        title: 'Create a rectangle calculator',
        prompt:
          'Complete int calculateArea(int width, int height) so it returns their product. Call it for a rectangle 7 units wide and 4 units high, then print "Area: 28".',
        starter:
          '#include <iostream>\nusing namespace std;\n\nint calculateArea(int width, int height) {\n    // TODO: return the area.\n    return 0;\n}\n\nint main() {\n    int area = calculateArea(7, 4);\n    cout << "Area: " << area << endl;\n    return 0;\n}',
        solution:
          '#include <iostream>\nusing namespace std;\n\nint calculateArea(int width, int height) {\n    return width * height;\n}\n\nint main() {\n    int area = calculateArea(7, 4);\n    cout << "Area: " << area << endl;\n    return 0;\n}',
        explanation:
          'The arguments 7 and 4 become width and height. return sends their product, 28, back to the caller.',
        expectedOutput: 'Area: 28',
      },
      practical: {
        title: 'Summarize a learner’s scores',
        prompt:
          'Complete calculateTotal(int values[], int count) to sum an array. Use the fixed array {75, 80, 85, 90} and count 4. In main, calculate the average using total / 4.0 and print the count, total, and average.',
        starter:
          '#include <iostream>\nusing namespace std;\n\nint calculateTotal(int values[], int count) {\n    int total = 0;\n    // TODO: add every array element to total.\n    return total;\n}\n\nint main() {\n    const int count = 4;\n    int scores[count] = {75, 80, 85, 90};\n    int total = calculateTotal(scores, count);\n    // TODO: calculate the average and print all three results.\n    return 0;\n}',
        solution:
          '#include <iostream>\nusing namespace std;\n\nint calculateTotal(int values[], int count) {\n    int total = 0;\n    for (int i = 0; i < count; i++) {\n        total += values[i];\n    }\n    return total;\n}\n\nint main() {\n    const int count = 4;\n    int scores[count] = {75, 80, 85, 90};\n    int total = calculateTotal(scores, count);\n    double average = total / 4.0;\n    cout << "Assessments: " << count << endl;\n    cout << "Total score: " << total << endl;\n    cout << "Average score: " << average << endl;\n    return 0;\n}',
        expectedOutput: 'Assessments: 4\nTotal score: 330\nAverage score: 82.5',
      },
      quiz: [
        {
          id: 'functions-q1',
          question: 'What does return do inside a function?',
          options: [
            'Always prints a message',
            'Repeats the function',
            'Sends a value to the caller and ends the call',
            'Creates a new array',
          ],
          answer: 2,
          explanation:
            'return passes a result to the caller and exits the current function call.',
        },
        {
          id: 'functions-q2',
          question: 'For int scores[3] = {70, 80, 90};, what is scores[1]?',
          options: ['70', '80', '90', '3'],
          answer: 1,
          explanation:
            'Array indexes start at 0, so index 1 is the second element, 80.',
        },
        {
          id: 'functions-q3',
          question:
            'Why do these examples pass count alongside an array parameter?',
          options: [
            'The parameter does not carry the number of elements',
            'Arrays always contain 10 elements',
            'The compiler counts every loop automatically',
            'count changes all elements to zero',
          ],
          answer: 0,
          explanation:
            'An array parameter does not preserve its element count. Passing count gives the loop its boundary.',
        },
      ],
      test: [
        {
          id: 'functions-t1',
          question:
            'Given int doubleValue(int n) { return n * 2; }, what is doubleValue(6)?',
          options: ['6', '8', '0', '12'],
          answer: 3,
          explanation:
            'The argument 6 becomes n, and the function returns 6 × 2 = 12.',
        },
        {
          id: 'functions-t2',
          question:
            'An array has count elements. What is the index of its last element?',
          options: ['count', 'count - 1', '1', '-1'],
          answer: 1,
          explanation:
            'Zero-based indexing makes the last valid index one less than the element count.',
        },
        {
          id: 'functions-t3',
          question:
            'A sum starts at 0 and adds every value in {2, 4, 6}. What total does it return?',
          options: ['6', '3', '12', '0'],
          answer: 2,
          explanation: 'The accumulator changes from 0 to 2, then 6, then 12.',
        },
      ],
    },
  },
]
