import { CommonModule, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, NgModel, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertModule, AvatarComponent, ButtonModule, CardModule, FormModule, GridModule, ModalModule, ProgressBarDirective, ProgressComponent, TableDirective, TableModule, TextColorDirective, UtilitiesModule } from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { MalClass } from 'src/app/models/mal-class';
import { MalGroup } from 'src/app/models/mal-group';
import { MalClassService } from 'src/app/service/mal-class.service';
import { MalGroupService } from 'src/app/service/mal-group.service';
@Component({
  selector: 'app-material-group-definitions',
  standalone: true,
  templateUrl: './material-group-definitions.component.html',
  styleUrl: './material-group-definitions.component.scss',
  imports: [AlertModule, GridModule, FormModule, CardModule, TableModule,
    UtilitiesModule, AvatarComponent, ProgressComponent, HttpClientModule,
    TextColorDirective, IconDirective, ReactiveFormsModule, ProgressBarDirective,
    ProgressComponent, TableDirective, ModalModule, ButtonModule, NgTemplateOutlet,
    NgFor, NgIf, FormsModule, CommonModule ],
  providers: [MalGroupService, MalClassService, NgModel]
})
export class MaterialGroupDefinitionsComponent implements OnInit{
  // Filitreleme değerleri//
  malGroups: MalGroup[] = [];
  malClasses: MalClass[] = [];
  public filteredData: any[] = []; 
  public MalGroupNameFilter: string = ''; 
  public MalClassNameFilter: string = ''; 

  // Tablodan data seçme degerleri //
  selectedMalGroup?: string | null = null;

  // Ekleme işlemi değerleri //
  public visible = false;
  malGroupForm: FormGroup;

  // Güncelleme İşlemi değerleri //
  isEditMode = false;

  // Güncelleme Modal değerleri //
  submitted = false;

  // Silme işlemi değerleri
  malGroupToDelete?: MalClass | null = null;
  isDeleteModalVisible: boolean = false;
  userAnswer: number | null = null;
  isCorrectAnswer = false;
  randomNumber1!: number;
  randomNumber2!: number;
  randomOperator!: string;
  correctAnswer!: number;

  constructor(private malClassService: MalClassService,private malGroupService: MalGroupService, private formBuilder: FormBuilder) {
    this.malGroupForm = this.formBuilder.group({
      id: [''],
      malClassId: ['', Validators.required],
      name: ['', Validators.required],
      code: ['', Validators.required],
      amount: ['', Validators.required],
      description: ['', Validators.required],
      url: ['', Validators.required]
    });
    this.malClassService.getMalClass(0, 10).subscribe((response: any) => {this.malClasses = response.items;});
    this.generateRandomQuestion();
  }

  ngOnInit() {
    
    this.loadData();

  }

  // Tablodan data seçme Foksiyonları //
  selectMalGroup(malGroup: MalGroup): void {
    this.selectedMalGroup = this.selectedMalGroup === malGroup.id ? null : malGroup.id;
    console.log('Seçilen Malzeme Tipi ID:', this.selectedMalGroup);
    console.log('Tıklanan Malzeme Tipi ID:', malGroup.id);
  }

  trackById(index: number, item: MalGroup): string {
    // Eğer item.id undefined ise, boş bir string döndür
    return item.id ?? '';
  }

  // Filtreleme Foksiyonları
  loadData(): void {
    this.malGroupService.getMalGroup(0, 10).subscribe((response: any) => {
      this.malGroups = response.items; // Servisten dönen items listesini malGroups'e aktarıyoruz
      this.filteredData = response.items;
      this.filterData();
    })
  }

  filterData(): void {
    this.filteredData = this.malGroups.filter(item => {
      const matchesName = this.MalClassNameFilter
        ? item.malClassName?.toLowerCase().includes(this.MalClassNameFilter.toLowerCase())
        : true;

      const matchesCode = this.MalGroupNameFilter
        ? item.name?.toLowerCase().includes(this.MalGroupNameFilter.toLowerCase())
        : true;

      return matchesName && matchesCode;
    });
  }

  filterClean(): void {
    this.MalGroupNameFilter = '';
    this.MalClassNameFilter = '';
    this.loadData();
  }

  // ⚡ Ekleme işlemi foksiyonları ⚡//
  toggleNewMalGroupModal() {
    this.visible = !this.visible;  // Modal'ın görünürlüğünü değiştiriyoruz
    this.malGroupForm.reset();
  }

  // ⚡ Ekleme modal işlemi foksiyonları ⚡//
  saveNewMalGroup(): void {
    if (this.malGroupForm.valid) {
      const newMalGroup = this.malGroupForm.value; // Formdaki veriyi alıyoruz

      this.malGroupService.addMalGroup(newMalGroup).subscribe(
        (response) => {
          console.log('Yeni Malzeme Tipi Eklendi:', response);
          this.malGroups.push(response); // Listeye ekliyoruz
          this.visible = false; // Modal'ı kapatıyoruz
          this.malGroupForm.reset(); // Formu sıfırlıyoruz
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
  editMalGroup(): void {
    if (this.selectedMalGroup) {
      this.malGroupService.getMalGroupById(this.selectedMalGroup).subscribe((response: MalGroup) => {
        // API'den gelen veriyi forma aktarıyoruz
        this.malGroupForm.patchValue({
          id: response.id,
          malClassId: response.malClassId,
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

    if (this.malGroupForm.invalid) {
      return;  // Hatalı form ise işlem yapma
    }

    // Form verilerini işleme
    console.log(this.malGroupForm.value);
  }

  saveChanges(): void {
    if (this.malGroupForm.valid) {
      // Formun değerlerini JSON string formatında alıyoruz
      const updatedMalGroupJson: string = JSON.stringify(this.malGroupForm.value);

      this.malGroupService.updateMalGroup(this.selectedMalGroup!, updatedMalGroupJson).subscribe((response) => {
        console.log('Güncelleme başarılı:', response);
        // Güncellenen malzeme tipini listeye yansıtıyoruz
        this.malGroups = this.malGroups.map((malGroup) =>
          malGroup.id === this.selectedMalGroup ? { ...malGroup, ...this.malGroupForm.value } : malGroup
        );
        this.isEditMode = false; // Düzenleme modunu kapatıyoruz
        this.malGroupForm.reset();
        this.loadData();
      });
    }
  }

  openAddMalGroupModal(): void {
    this.isEditMode = false; // Düzenleme modu değil
    this.malGroupForm.reset(); // Formu sıfırlıyoruz

  }
  

  // ⚡ Silme işlemi foksiyonları ⚡//
  deleteConfirmation(selectedId: string | null): void {
    if (selectedId) {
      this.malGroupToDelete =
        this.malGroups.find((malGroup) => malGroup.id === selectedId) || null;
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
    if (this.isCorrectAnswer && this.malGroupToDelete) {
      this.malGroupService.deleteMalGroup(this.malGroupToDelete.id!).subscribe(
        () => {
          this.malGroups = this.malGroups.filter(
            (malGroups) => malGroups.id !== this.malGroupToDelete?.id
          );
          this.malGroupToDelete = null;
          this.selectedMalGroup = null;
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
    this.malGroupToDelete = null; // Silme işlemini iptal et

  }

}
