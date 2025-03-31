<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <style>
      /* 
         * عنصر الحاوية (.container):
         * يحتوي على الخلايا السداسية، ويُستخدم لضبط الخلفية وكذلك تحديد أبعاد مربع الرؤية.
         */
      .container {
        position: relative;
        margin: 50px auto;
        /* سيتم تعديل العرض والارتفاع من داخل الكود حسب إعدادات مربع الرؤية */
        width: 700px;
      }
      /* 
         * عنصر الخلية السداسية (.hexagon):
         * هذه هي الخلايا التي تعرض الحروف داخل الشكل السداسي.
         * يتم تحديد أبعادها، شكلها (باستخدام clip-path) وبعض خصائص التنسيق مثل الخط والمحاذاة.
         */
      .hexagon {
        position: absolute; /* لضمان وضع الخلايا بناءً على الإحداثيات */
        width: 50px;
        height: 55px;
        background-color: #ffffff;
        clip-path: polygon(
          50% 0%,
          100% 25%,
          100% 75%,
          50% 100%,
          0% 75%,
          0% 25%
        ); /* لتشكيل الخلية السداسية */
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background-color 0.3s, left 0.3s, top 0.3s; /* تأثيرات انتقال للحركة وتغيير اللون */
        font-family: "Simplified Arabic";
        font-size: 24px;
      }
    </style>
  </head>
  <body>
    <!-- عنصر الحاوية الذي ستُضاف إليه الخلايا السداسية والصورة الأساسية والإضافية والنصوص -->
    <div class="container" id="grid"></div>

    <script>
      class HexGame {
        constructor() {
          // مصفوفة لتخزين كل الخلايا (صفوف وخلايا)
          this.hexagons = [];

          // ========== نظام الإحداثيات الأساسي والأوفست ==========
          // هنا نحدد الإحداثيات الأساسية لكل خلية في كل صف (الإحداثيات الافتراضية بدون تعديلات)
          this.baseCoordinates = [
            // السطر 1 (من اليمين إلى اليسار)
            [
              { x: -48, y: 0 }, // الخلية 1 (يمين)
              { x: 55, y: 0 }, // الخلية 2
              { x: 158, y: 0 }, // الخلية 3
              { x: 261, y: 0 }, // الخلية 4
              { x: 364, y: 0 }, // الخلية 5 (يسار)
            ],
            // السطر 2 (مع إزاحة)
            [
              { x: -21, y: 48 }, // الخلية 1
              { x: 82, y: 48 }, // الخلية 2
              { x: 185, y: 48 }, // الخلية 3
              { x: 288, y: 48 }, // الخلية 4
              { x: 391, y: 48 }, // الخلية 5
            ],
            // السطر 3
            [
              { x: -48, y: 96 }, // الخلية 1
              { x: 55, y: 96 }, // الخلية 2
              { x: 158, y: 96 }, // الخلية 3
              { x: 261, y: 96 }, // الخلية 4
              { x: 364, y: 96 }, // الخلية 5
            ],
            // السطر 4 (مع إزاحة)
            [
              { x: -21, y: 144 }, // الخلية 1
              { x: 82, y: 144 }, // الخلية 2
              { x: 185, y: 144 }, // الخلية 3
              { x: 288, y: 144 }, // الخلية 4
              { x: 391, y: 144 }, // الخلية 5
            ],
            // السطر 5
            [
              { x: -48, y: 194 }, // الخلية 1
              { x: 55, y: 194 }, // الخلية 2
              { x: 158, y: 194 }, // الخلية 3
              { x: 261, y: 194 }, // الخلية 4
              { x: 364, y: 194 }, // الخلية 5
            ],
          ];

          // ========== نظام التحكم في الأسطر والشكل ==========
          // مصفوفة الإزاحات الخاصة بكل صف لضبط الموقع بدقة (تُستخدم لتعديل موضع كل صف)
          this.rowOffsets = [
            { x: -98, y: 4 }, // أوفست السطر 1
            { x: 26, y: 44 }, // أوفست السطر 2
            { x: 2, y: 84 }, // أوفست السطر 3
            { x: 26, y: 124 }, // أوفست السطر 4
            { x: 2, y: 162 }, // أوفست السطر 5
          ];

          // متغير لتحديد الإزاحة العامة (يُستخدم لتحريك الشكل ككل)
          this.globalOffset = { x: 305, y: 300 }; // الإضافة الجديدة

          // ========== إعدادات تعديل حجم كل خلية بشكل فردي ==========
          /* هنا يمكنك تعديل قيمة كل خلية بشكل منفصل.
                   على سبيل المثال:
                   cellScales[0][0] = 1; // الحجم الطبيعي للخلية الأولى في الصف الأول
                   cellScales[0][1] = 1; // الحجم الطبيعي للخلية الثانية في الصف الأول
                   وهكذا...
                */
          this.cellScales = [
            [2, 2, 2, 2, 2], // السطر الأول
            [2, 2, 2, 2, 2], // السطر الثاني
            [2, 2, 2, 2, 2], // السطر الثالث
            [2, 2, 2, 2, 2], // السطر الرابع
            [2, 2, 2, 2, 2], // السطر الخامس
          ];

          // توليد حروف عربية عشوائية من مجموعة أساسية بعد خلطها
          this.letters = this.generateBasicArabicLetters(25);

          // ========== إعدادات الخلفية (قبل تشغيل الكود) ==========
          // إعدادات الخلفية للصورة الأساسية التي تظهر خلف الخلايا
          this.backgroundImagePath = "IMG_7698.png"; // تعديل المسار واسم الصورة كما هو مرفوع
          this.backgroundPosition = { x: 130, y: 280 }; // تعديل إحداثيات الخلفية لتحريكها داخل الحاوية
          this.backgroundSize = { width: 815, height: 590 }; // التحكم في أبعاد الصورة كما ستُعرض
          this.backgroundViewSize = { width: 1000, height: 900 }; // التحكم في حجم مربع الرؤية (الحاوية التي ستُعرض فيها الخلفية)
          // ======================================================

          // استدعاء دالة إنشاء الشكل (الخلايا والخلفية الأساسية)
          this.initGrid();

          // ======== إضافة الصور الإضافية ==========
          // استدعاء دوال إنشاء الصور الإضافية (ثلاث صور منفصلة)
          this.initAdditionalImage2();
          this.initAdditionalImage3();
          this.initAdditionalImage4();
          // =========================================

          // ======== إضافة النصوص الإضافية ==========
          // استدعاء دوال إنشاء النصوص الإضافية (ثلاث نصوص منفصلة)
          this.initAdditionalText1();
          this.initAdditionalText2();
          this.initAdditionalText3();
          // =========================================
        }

        // ========== الإضافات الجديدة: التحكم في الشكل ككل ==========
        // دالة لتحريك الشكل ككل بإضافة قيمة إلى الإزاحة العامة
        moveEntireGrid(x, y) {
          this.globalOffset.x += x;
          this.globalOffset.y += y;
          this.updateAllPositions();
        }

        // دالة لإعادة تعيين الإزاحة العامة إلى القيم الافتراضية
        resetEntireGrid() {
          this.globalOffset = { x: 0, y: 0 };
          this.updateAllPositions();
        }

        // تحديث مواقع جميع الخلايا بناءً على الإزاحات (الأساسية والعمومية)
        updateAllPositions() {
          this.hexagons.forEach((row, rowIndex) => {
            this.updateRowPositions(rowIndex);
          });
        }

        // تحديث مواقع خلايا صف معين
        updateRowPositions(rowIndex) {
          this.hexagons[rowIndex].forEach((hex, cellIndex) => {
            const base = this.baseCoordinates[rowIndex][cellIndex];
            const rowOffset = this.rowOffsets[rowIndex];
            // حساب الموضع الجديد لكل خلية مع إضافة الإزاحة العامة
            hex.style.left = `${base.x + rowOffset.x + this.globalOffset.x}px`;
            hex.style.top = `${base.y + rowOffset.y + this.globalOffset.y}px`;
          });
        }

        // ========== دوال التحكم في الأسطر (كما كانت) ==========
        // دالة لتحريك صف كامل أفقيًا
        moveEntireRowX(rowIndex, offsetX) {
          if (rowIndex < 0 || rowIndex > 4) return;
          this.rowOffsets[rowIndex].x += offsetX;
          this.updateRowPositions(rowIndex);
        }

        // دالة لتحريك صف كامل عموديًا
        moveEntireRowY(rowIndex, offsetY) {
          if (rowIndex < 0 || rowIndex > 4) return;
          this.rowOffsets[rowIndex].y += offsetY;
          this.updateRowPositions(rowIndex);
        }

        // دالة لإعادة تعيين إزاحة صف كامل إلى الوضع الافتراضي
        resetEntireRow(rowIndex) {
          if (rowIndex < 0 || rowIndex > 4) return;
          this.rowOffsets[rowIndex] = { x: 0, y: 0 };
          this.updateRowPositions(rowIndex);
        }

        // ========== باقي الدوال دون تغيير ==========
        // دالة لتوليد مجموعة من الحروف العربية العشوائية من مصفوفة أساسية
        generateBasicArabicLetters(count) {
          const basicLetters = [
            "أ",
            "ب",
            "ت",
            "ث",
            "ج",
            "ح",
            "خ",
            "د",
            "ذ",
            "ر",
            "ز",
            "س",
            "ش",
            "ص",
            "ض",
            "ط",
            "ظ",
            "ع",
            "غ",
            "ف",
            "ق",
            "ك",
            "ل",
            "م",
            "ن",
            "ه",
            "و",
            "ي",
          ];
          return [...basicLetters]
            .sort(() => Math.random() - 0.5)
            .slice(0, count);
        }

        // دالة إنشاء الشكل (initGrid): تنشئ الخلفية الأساسية والخلايا وتضعها في الحاوية
        initGrid() {
          const container = document.getElementById("grid");

          // ========== ضبط الخلفية باستخدام إعدادات الخلفية ==========
          // تعيين صورة الخلفية الأساسية ومسارها
          container.style.backgroundImage = `url('${this.backgroundImagePath}')`;
          // تحديد حجم الصورة التي ستُعرض داخل الحاوية
          container.style.backgroundSize = `${this.backgroundSize.width}px ${this.backgroundSize.height}px`;
          // منع تكرار الصورة (صورة واحدة فقط)
          container.style.backgroundRepeat = "no-repeat";
          // تحديد موقع الخلفية بناءً على الإحداثيات المعطاة
          container.style.backgroundPosition = `${this.backgroundPosition.x}px ${this.backgroundPosition.y}px`;

          // تعديل أبعاد الحاوية لتكون بمربع رؤية كبير كما هو محدد
          container.style.width = `${this.backgroundViewSize.width}px`;
          container.style.height = `${this.backgroundViewSize.height}px`;
          // =============================================================

          // إنشاء الخلايا باستخدام الإحداثيات الأساسية والإزاحات وحجم كل خلية
          this.hexagons = this.baseCoordinates.map((row, rowIndex) => {
            return row.map((cell, cellIndex) => {
              const hex = document.createElement("div");
              hex.className = "hexagon";
              // تعيين النص داخل الخلية إلى الحرف الذي تم توليده عشوائيًا
              hex.textContent = this.letters[rowIndex * 5 + cellIndex];

              // تطبيق جميع الإزاحات: الحساب يشمل الإحداثيات الأساسية، الإزاحة الخاصة بالصف، والإزاحة العامة
              const rowOffset = this.rowOffsets[rowIndex];
              hex.style.left = `${
                cell.x + rowOffset.x + this.globalOffset.x
              }px`;
              hex.style.top = `${cell.y + rowOffset.y + this.globalOffset.y}px`;

              // ========== تطبيق إعدادات تعديل حجم الخلايا بشكل فردي ==========
              // تعديل حجم كل خلية بناءً على قيمة التكبير/التصغير المحددة في cellScales
              const cellScale = this.cellScales[rowIndex][cellIndex];
              hex.style.width = `${50 * cellScale}px`;
              hex.style.height = `${55 * cellScale}px`;
              // تعديل حجم الخط ليتناسب مع حجم الخلية
              hex.style.fontSize = `${24 * cellScale}px`;
              // ==========================================================

              // تعيين حالة الخلية (state) والقيمة الأصلية للحرف (char) في خصائص البيانات
              hex.dataset.state = "0";
              hex.dataset.char = this.letters[rowIndex * 5 + cellIndex];

              // إضافة مستمع حدث للنقر على الخلية لاستدعاء دالة handleClick
              hex.addEventListener("click", (e) => this.handleClick(e.target));
              // إضافة الخلية إلى الحاوية
              container.appendChild(hex);
              return hex;
            });
          });
        }

        // دالة التعامل مع نقر الخلية (handleClick)
        handleClick(hex) {
          // تم تعديل الدورة لتصبح من 0 إلى 3 (4 حالات)
          const currentState = parseInt(hex.dataset.state);
          const newState = (currentState + 1) % 4;
          hex.dataset.state = newState.toString();

          // استخدام switch لتحديد ما يجب فعله بناءً على الحالة الجديدة
          switch (newState) {
            case 0:
              // الحالة الافتراضية: خلفية بيضاء مع ظهور الحرف
              hex.style.backgroundColor = "#FFFFFF";
              hex.textContent = hex.dataset.char;
              this.resetRelatedHexes(hex.dataset.char);
              break;
            case 1:
              // الحالة الجديدة: خلفية صفراء مع بقاء الحرف ظاهرًا (الحرف بلونه الأسود)
              hex.style.backgroundColor = "#FADB0C";
              // لا يتم تغيير نص الخلية؛ يبقى الحرف ظاهرًا
              break;
            case 2:
              // الحالة التالية: خلفية برتقالية مع إخفاء الحرف
              hex.style.backgroundColor = "#FF7835";
              hex.textContent = "";
              this.hideRelatedChars(hex.dataset.char);
              break;
            case 3:
              // الحالة التالية: خلفية خضراء
              hex.style.backgroundColor = "#3BB419";
              break;
          }
        }

        // دالة لإخفاء الحروف للخلايا المرتبطة بحرف معين (hideRelatedChars)
        hideRelatedChars(char) {
          document.querySelectorAll(".hexagon").forEach((h) => {
            // إذا كانت الخلية تحتوي على نفس الحرف وكانت حالتها ليست برتقالية (2)
            if (h.dataset.char === char && h.dataset.state !== "2") {
              h.textContent = "";
              h.style.backgroundColor = "#FF7835";
              h.dataset.state = "2";
            }
          });
        }

        // دالة لإعادة تعيين الخلايا المرتبطة بحرف معين إلى الحالة الافتراضية (resetRelatedHexes)
        resetRelatedHexes(char) {
          document.querySelectorAll(".hexagon").forEach((h) => {
            if (h.dataset.char === char) {
              h.textContent = h.dataset.char;
              h.style.backgroundColor = "#FFFFFF";
              h.dataset.state = "0";
            }
          });
        }

        // ========== برمجة الصور الإضافية ==========
        /* في هذا القسم تمت إضافة ثلاث دوال منفصلة لإنشاء ثلاثة صور إضافية.
         * كل صورة إضافية تُبرمج بنفس أسلوب الصورة الأساسية مع إمكانية التحكم في:
         * - مسار الصورة (backgroundImagePathX)
         * - إحداثيات الصورة (backgroundPositionX)
         * - حجم الصورة (backgroundSizeX)
         * - حجم مربع الرؤية الخاص بالصورة (backgroundViewSizeX) – إذا كنت تريد استخدامها
         * تمت إضافة هذه العناصر كـ divات مطلقة داخل الحاوية بحيث يمكنك تعديلها كما تريد.
         */

        initAdditionalImage2() {
          // إعدادات الصورة الثانية
          this.backgroundImagePath2 = "IMG_7750.PNG"; // تأكد من رفع الصورة وتسميتها بشكل صحيح
          this.backgroundPosition2 = { x: 380, y: 200 }; // إحداثيات الصورة الثانية داخل الحاوية
          this.backgroundSize2 = { width: 300, height: 120 }; // أبعاد الصورة الثانية كما ستُعرض
          this.backgroundViewSize2 = { width: 300, height: 200 }; // حجم مربع الرؤية للصورة الثانية (يمكن استخدامه لتحديد حجم العنصر)

          const container = document.getElementById("grid");
          const imgDiv2 = document.createElement("div");
          imgDiv2.className = "bgImage2";
          imgDiv2.style.position = "absolute";
          // تحديد الإحداثيات باستخدام إعدادات الصورة الثانية
          imgDiv2.style.left = `${this.backgroundPosition2.x}px`;
          imgDiv2.style.top = `${this.backgroundPosition2.y}px`;
          // تحديد أبعاد العنصر بناءً على إعدادات حجم الصورة
          imgDiv2.style.width = `${this.backgroundSize2.width}px`;
          imgDiv2.style.height = `${this.backgroundSize2.height}px`;
          // تعيين الخلفية باستخدام مسار الصورة الثانية وإعدادات الحجم
          imgDiv2.style.backgroundImage = `url('${this.backgroundImagePath2}')`;
          imgDiv2.style.backgroundSize = "cover";
          imgDiv2.style.backgroundRepeat = "no-repeat";
          // وضع العنصر خلف الخلايا (يمكنك تعديل z-index حسب الحاجة)
          imgDiv2.style.zIndex = "-1";
          container.appendChild(imgDiv2);
        }

        initAdditionalImage3() {
          // إعدادات الصورة الثالثة
          this.backgroundImagePath3 = "IMAGE3.png"; // تأكد من رفع الصورة وتسميتها بشكل صحيح
          this.backgroundPosition3 = { x: 400, y: 100 }; // إحداثيات الصورة الثالثة داخل الحاوية
          this.backgroundSize3 = { width: 350, height: 250 }; // أبعاد الصورة الثالثة كما ستُعرض
          this.backgroundViewSize3 = { width: 350, height: 250 }; // حجم مربع الرؤية للصورة الثالثة

          const container = document.getElementById("grid");
          const imgDiv3 = document.createElement("div");
          imgDiv3.className = "bgImage3";
          imgDiv3.style.position = "absolute";
          // تحديد الإحداثيات باستخدام إعدادات الصورة الثالثة
          imgDiv3.style.left = `${this.backgroundPosition3.x}px`;
          imgDiv3.style.top = `${this.backgroundPosition3.y}px`;
          // تحديد أبعاد العنصر بناءً على إعدادات حجم الصورة
          imgDiv3.style.width = `${this.backgroundSize3.width}px`;
          imgDiv3.style.height = `${this.backgroundSize3.height}px`;
          // تعيين الخلفية باستخدام مسار الصورة الثالثة وإعدادات الحجم
          imgDiv3.style.backgroundImage = `url('${this.backgroundImagePath3}')`;
          imgDiv3.style.backgroundSize = "cover";
          imgDiv3.style.backgroundRepeat = "no-repeat";
          // وضع العنصر خلف الخلايا
          imgDiv3.style.zIndex = "-1";
          container.appendChild(imgDiv3);
        }

        initAdditionalImage4() {
          // إعدادات الصورة الرابعة
          this.backgroundImagePath4 = "IMAGE4.png"; // تأكد من رفع الصورة وتسميتها بشكل صحيح
          this.backgroundPosition4 = { x: 750, y: 150 }; // إحداثيات الصورة الرابعة داخل الحاوية
          this.backgroundSize4 = { width: 320, height: 240 }; // أبعاد الصورة الرابعة كما ستُعرض
          this.backgroundViewSize4 = { width: 320, height: 240 }; // حجم مربع الرؤية للصورة الرابعة

          const container = document.getElementById("grid");
          const imgDiv4 = document.createElement("div");
          imgDiv4.className = "bgImage4";
          imgDiv4.style.position = "absolute";
          // تحديد الإحداثيات باستخدام إعدادات الصورة الرابعة
          imgDiv4.style.left = `${this.backgroundPosition4.x}px`;
          imgDiv4.style.top = `${this.backgroundPosition4.y}px`;
          // تحديد أبعاد العنصر بناءً على إعدادات حجم الصورة
          imgDiv4.style.width = `${this.backgroundSize4.width}px`;
          imgDiv4.style.height = `${this.backgroundSize4.height}px`;
          // تعيين الخلفية باستخدام مسار الصورة الرابعة وإعدادات الحجم
          imgDiv4.style.backgroundImage = `url('${this.backgroundImagePath4}')`;
          imgDiv4.style.backgroundSize = "cover";
          imgDiv4.style.backgroundRepeat = "no-repeat";
          // وضع العنصر خلف الخلايا
          imgDiv4.style.zIndex = "-1";
          container.appendChild(imgDiv4);
        }

        // ========== برمجة النصوص الإضافية ==========
        /* في هذا القسم تمت إضافة ثلاث دوال منفصلة لإنشاء ثلاثة نصوص إضافية.
         * كل نص يتم برمجته بنفس أسلوب الصور الإضافية بحيث يمكنك التحكم فيه:
         * - محتوى النص (textContentX)
         * - إحداثيات النص (textPositionX)
         * - حجم مربع النص (textSizeX)
         * - حجم الخط الخاص بالنص (textFontSizeX)
         * تمت إضافة هذه العناصر كـ divات مطلقة داخل الحاوية بحيث يمكنك تعديلها كما تريد.
         */

        initAdditionalText1() {
          // إعدادات النص الأول
          this.textContent1 = "سباق الحروف"; // المحتوى الافتراضي للنص الأول
          this.textPosition1 = { x: 435, y: 250 }; // إحداثيات النص داخل الحاوية
          this.textSize1 = { width: 200, height: 50 }; // أبعاد مربع النص
          this.textFontSize1 = 40; // حجم الخط الخاص بالنص الأول

          const container = document.getElementById("grid");
          const textDiv1 = document.createElement("div");
          textDiv1.className = "additionalText1";
          textDiv1.style.position = "absolute";
          // تحديد الإحداثيات باستخدام إعدادات النص الأول
          textDiv1.style.left = `${this.textPosition1.x}px`;
          textDiv1.style.top = `${this.textPosition1.y}px`;
          // تحديد أبعاد مربع النص
          textDiv1.style.width = `${this.textSize1.width}px`;
          textDiv1.style.height = `${this.textSize1.height}px`;
          // تعيين حجم الخط ولون النص
          textDiv1.style.fontSize = `${this.textFontSize1}px`;
          textDiv1.style.color = "#000000";
          textDiv1.style.background = "transparent";
          // ضبط z-index بحيث يظهر فوق الخلفيات ولكن خلف الخلايا إذا رغبت
          textDiv1.style.zIndex = "1";
          // تعيين محتوى النص
          textDiv1.textContent = this.textContent1;
          container.appendChild(textDiv1);
        }

        initAdditionalText2() {
          // إعدادات النص الثاني
          this.textContent2 = "النص الثاني"; // المحتوى الافتراضي للنص الثاني
          this.textPosition2 = { x: 300, y: 600 }; // إحداثيات النص داخل الحاوية
          this.textSize2 = { width: 250, height: 50 }; // أبعاد مربع النص
          this.textFontSize2 = 0; // حجم الخط الخاص بالنص الثاني

          const container = document.getElementById("grid");
          const textDiv2 = document.createElement("div");
          textDiv2.className = "additionalText2";
          textDiv2.style.position = "absolute";
          // تحديد الإحداثيات باستخدام إعدادات النص الثاني
          textDiv2.style.left = `${this.textPosition2.x}px`;
          textDiv2.style.top = `${this.textPosition2.y}px`;
          // تحديد أبعاد مربع النص
          textDiv2.style.width = `${this.textSize2.width}px`;
          textDiv2.style.height = `${this.textSize2.height}px`;
          // تعيين حجم الخط ولون النص
          textDiv2.style.fontSize = `${this.textFontSize2}px`;
          textDiv2.style.color = "#000000";
          textDiv2.style.background = "transparent";
          textDiv2.style.zIndex = "1";
          // تعيين محتوى النص
          textDiv2.textContent = this.textContent2;
          container.appendChild(textDiv2);
        }

        initAdditionalText3() {
          // إعدادات النص الثالث
          this.textContent3 = "النص الثالث"; // المحتوى الافتراضي للنص الثالث
          this.textPosition3 = { x: 600, y: 600 }; // إحداثيات النص داخل الحاوية
          this.textSize3 = { width: 300, height: 60 }; // أبعاد مربع النص
          this.textFontSize3 = 0; // حجم الخط الخاص بالنص الثالث

          const container = document.getElementById("grid");
          const textDiv3 = document.createElement("div");
          textDiv3.className = "additionalText3";
          textDiv3.style.position = "absolute";
          // تحديد الإحداثيات باستخدام إعدادات النص الثالث
          textDiv3.style.left = `${this.textPosition3.x}px`;
          textDiv3.style.top = `${this.textPosition3.y}px`;
          // تحديد أبعاد مربع النص
          textDiv3.style.width = `${this.textSize3.width}px`;
          textDiv3.style.height = `${this.textSize3.height}px`;
          // تعيين حجم الخط ولون النص
          textDiv3.style.fontSize = `${this.textFontSize3}px`;
          textDiv3.style.color = "#000000";
          textDiv3.style.background = "transparent";
          textDiv3.style.zIndex = "1";
          // تعيين محتوى النص
          textDiv3.textContent = this.textContent3;
          container.appendChild(textDiv3);
        }
      }

      // ========== أمثلة الاستخدام ==========
      // إنشاء كائن من الفئة HexGame لتطبيق اللعبة
      const game = new HexGame();

      // تحريك السطر الأول 100 بكسل لليمين باستخدام دالة moveEntireRowX
      game.moveEntireRowX(0, 100);

      // تحريك الشكل كله 50 بكسل لأسفل باستخدام دالة moveEntireGrid
      game.moveEntireGrid(0, 50);

      // عند تحميل الصفحة، يتم تشغيل اللعبة
      window.onload = () => game;
    </script>
  </body>
</html>
