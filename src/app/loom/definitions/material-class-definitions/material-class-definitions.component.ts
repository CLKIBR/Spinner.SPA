import { CommonModule, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, NgModel, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertModule, AvatarComponent, ButtonModule, CardModule, FormModule, GridModule, ModalModule, ProgressBarDirective, ProgressComponent, TableDirective, TableModule, TextColorDirective, UtilitiesModule } from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { MalClass } from 'src/app/models/mal-class';
import { MalType } from 'src/app/models/mal-type';
import { MalClassService } from 'src/app/service/mal-class.service';
import { MalTypeService } from 'src/app/service/mal-type.service';

@Component({
  selector: 'app-material-class-definitions',
  templateUrl: './material-class-definitions.component.html',
  styleUrl: './material-class-definitions.component.scss',
  standalone: true,
  imports: [AlertModule, GridModule, FormModule, CardModule, TableModule,
    UtilitiesModule, AvatarComponent, ProgressComponent, HttpClientModule,
    TextColorDirective, IconDirective, ReactiveFormsModule, ProgressBarDirective,
    ProgressComponent, TableDirective, ModalModule, ButtonModule, NgTemplateOutlet,
    NgFor, NgIf, FormsModule, CommonModule ],
  providers: [MalTypeService, MalClassService, NgModel]
})

export class MaterialClassDefinitionsComponent implements OnInit{
  
  // Filitreleme değerleri//
  malTypes: MalType[] = [];
  malClasses: MalClass[] = [];
  public filteredData: any[] = []; 
  public MalTypeNameFilter: string = ''; 
  public MalClassNameFilter: string = ''; 

  // Tablodan data seçme degerleri //
  selectedMalClass?: string | null = null;

  // Ekleme işlemi değerleri //
  public visible = false;
  malClassForm: FormGroup;

  // Güncelleme İşlemi değerleri //
  isEditMode = false;

  // Güncelleme Modal değerleri //
  submitted = false;

  // Silme işlemi değerleri
  malClassToDelete?: MalClass | null = null;
  isDeleteModalVisible: boolean = false;
  userAnswer: number | null = null;
  isCorrectAnswer = false;
  randomNumber1!: number;
  randomNumber2!: number;
  randomOperator!: string;
  correctAnswer!: number;

  constructor(private malClassService: MalClassService,private malTypeService: MalTypeService, private formBuilder: FormBuilder) {
    this.malClassForm = this.formBuilder.group({
      id: [''],
      malTypeId: ['', Validators.required],
      name: ['', Validators.required],
      code: ['', Validators.required],
      amount: ['', Validators.required],
      description: ['', Validators.required],
      url: ['', Validators.required]
    });
    this.malTypeService.getMalType(0, 10).subscribe((response: any) => {this.malTypes = response.items;});
    this.generateRandomQuestion();
  }

  ngOnInit() {
    
    this.loadData();

  }

  // Tablodan data seçme Foksiyonları //
  selectMalClass(malClass: MalClass): void {
    this.selectedMalClass = this.selectedMalClass === malClass.id ? null : malClass.id;
    console.log('Seçilen Malzeme Tipi ID:', this.selectedMalClass);
    console.log('Tıklanan Malzeme Tipi ID:', malClass.id);
  }

  trackById(index: number, item: MalClass): string {
    // Eğer item.id undefined ise, boş bir string döndür
    return item.id ?? '';
  }

  // Filtreleme Foksiyonları
  loadData(): void {
    this.malClassService.getMalClass(0, 10).subscribe((response: any) => {
      this.malClasses = response.items; // Servisten dönen items listesini malClasses'e aktarıyoruz
      this.filteredData = response.items;
      this.filterData();
    })
  }

  filterData(): void {
    this.filteredData = this.malClasses.filter(item => {
      const matchesName = this.MalTypeNameFilter
        ? item.malTypeName?.toLowerCase().includes(this.MalTypeNameFilter.toLowerCase())
        : true;

      const matchesCode = this.MalClassNameFilter
        ? item.name?.toLowerCase().includes(this.MalClassNameFilter.toLowerCase())
        : true;

      return matchesName && matchesCode;
    });
  }

  filterClean(): void {
    this.MalTypeNameFilter = '';
    this.MalClassNameFilter = '';
    this.loadData();
  }

  // ⚡ Ekleme işlemi foksiyonları ⚡//
  toggleNewMalClassModal() {
    this.visible = !this.visible;  // Modal'ın görünürlüğünü değiştiriyoruz
    this.malClassForm.reset();
  }

  // ⚡ Ekleme modal işlemi foksiyonları ⚡//
  saveNewMalClass(): void {
    if (this.malClassForm.valid) {
      const newMalClass = this.malClassForm.value; // Formdaki veriyi alıyoruz

      this.malClassService.addMalClass(newMalClass).subscribe(
        (response) => {
          console.log('Yeni Malzeme Tipi Eklendi:', response);
          this.malClasses.push(response); // Listeye ekliyoruz
          this.visible = false; // Modal'ı kapatıyoruz
          this.malClassForm.reset(); // Formu sıfırlıyoruz
          this.loadData();
        },
        (error) => {
          console.error('Yeni Malzeme Tipi eklenirken hata oluştu:', error);
        }
      );
    } else {
      console.log('Form geçersiz!');
    }
  }

  // ⚡ Güncelleme işlemi foksiyonları ⚡//
  editMalClass(): void {
    if (this.selectedMalClass) {
      this.malClassService.getMalClassById(this.selectedMalClass).subscribe((response: MalClass) => {
        // API'den gelen veriyi forma aktarıyoruz
        this.malClassForm.patchValue({
          id: response.id,
          malTypeId: response.malTypeId,
          name: response.name,
          code: response.code,
          amount: response.amount,
          description: response.description,
          url: response.url
        });
        this.isEditMode = true; // Düzenleme modunu aktif ediyoruz
      });
    }
  }

  // ⚡ Güncelleme modal işlemi foksiyonları ⚡//
  onSubmit() {
    this.submitted = true;  

    if (this.malClassForm.invalid) {
      return;  // Hatalı form ise işlem yapma
    }

    // Form verilerini işleme
    console.log(this.malClassForm.value);
  }

  saveChanges(): void {
    if (this.malClassForm.valid) {
      // Formun değerlerini JSON string formatında alıyoruz
      const updatedMalClassJson: string = JSON.stringify(this.malClassForm.value);

      this.malClassService.updateMalClass(this.selectedMalClass!, updatedMalClassJson).subscribe((response) => {
        console.log('Güncelleme başarılı:', response);
        // Güncellenen malzeme tipini listeye yansıtıyoruz
        this.malClasses = this.malClasses.map((malClass) =>
          malClass.id === this.selectedMalClass ? { ...malClass, ...this.malClassForm.value } : malClass
        );
        this.isEditMode = false; // Düzenleme modunu kapatıyoruz
        this.malClassForm.reset();
        this.loadData();
      });
    }
  }

  openAddMalClassModal(): void {
    this.isEditMode = false; // Düzenleme modu değil
    this.malClassForm.reset(); // Formu sıfırlıyoruz

  }
  

  // ⚡ Silme işlemi foksiyonları ⚡//
  deleteConfirmation(selectedId: string | null): void {
    if (selectedId) {
      this.malClassToDelete =
        this.malClasses.find((malClass) => malClass.id === selectedId) || null;
      this.isDeleteModalVisible = true; // Modal'ı aç
      this.resetModal(); // Modal sıfırlama

    }
  }

  resetModal(): void {
    this.userAnswer = null;
    this.isCorrectAnswer = false;
    this.generateRandomQuestion();
  }

  generateRandomQuestion(): void {
    // Random sayılar
    this.randomNumber1 = Math.floor(Math.random() * 10) + 1;
    this.randomNumber2 = Math.floor(Math.random() * 10) + 1;

    const operators = ['+', '-', '*', '/'];
    this.randomOperator = operators[Math.floor(Math.random() * operators.length)];

    // Çıkarma işlemi için randomNumber1 her zaman randomNumber2'den büyük olmalı
    if (this.randomOperator === '-') {
      if (this.randomNumber1 <= this.randomNumber2) {
        this.randomNumber1 = this.randomNumber2 + Math.floor(Math.random() * 10) + 1;
      }
    }

    // Bölme işlemi için randomNumber1 her zaman randomNumber2'den büyük olmalı ve sonuç tam sayı olmalı
    if (this.randomOperator === '/') {
      let isValidDivision = false;
      while (!isValidDivision) {
        if (this.randomNumber1 <= this.randomNumber2) {
          this.randomNumber1 = this.randomNumber2 + Math.floor(Math.random() * 10) + 1;
        }
        // Bölme işlemi için, tam sayı olması gerektiği kontrolü
        if (this.randomNumber1 % this.randomNumber2 === 0) {
          isValidDivision = true;
        } else {
          this.randomNumber2 = Math.floor(Math.random() * 10) + 1;
        }
      }
    }

    // İşlem sonucu hesaplama
    switch (this.randomOperator) {
      case '+':
        this.correctAnswer = this.randomNumber1 + this.randomNumber2;
        break;
      case '-':
        this.correctAnswer = this.randomNumber1 - this.randomNumber2;
        break;
      case '*':
        this.correctAnswer = this.randomNumber1 * this.randomNumber2;
        break;
      case '/':
        this.correctAnswer = this.randomNumber1 / this.randomNumber2;
        break;
    }
  }

  // ⚡ Silme modal işlemi foksiyonları ⚡//
  checkAnswer(): void {
    if (this.userAnswer !== null) {
      this.isCorrectAnswer = this.userAnswer === this.correctAnswer;
    }
  }

  confirmDelete(): void {
    if (this.isCorrectAnswer && this.malClassToDelete) {
      this.malClassService.deleteMalClass(this.malClassToDelete.id!).subscribe(
        () => {
          this.malClasses = this.malClasses.filter(
            (malClass) => malClass.id !== this.malClassToDelete?.id
          );
          this.malClassToDelete = null;
          this.selectedMalClass = null;
          this.isDeleteModalVisible = false; // Modal'ı kapat
          this.loadData();
        },
        (error) => console.error('Silme işlemi başarısız oldu', error)
      );
    } else {
      console.error('Doğru cevabı girmeniz gerekiyor!');
    }
  }

  cancelDelete(): void {
    this.isDeleteModalVisible = false; // Modal'ı kapat
    this.malClassToDelete = null; // Silme işlemini iptal et

  }


}
