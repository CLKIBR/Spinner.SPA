import { CommonModule, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, NgModel, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertModule, AvatarComponent, ButtonModule, CardModule, FormModule, GridModule, ModalModule, ProgressBarDirective, ProgressComponent, TableDirective, TableModule, TextColorDirective, UtilitiesModule } from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { MalDescription } from 'src/app/models/mal-description';
import { MalGroup } from 'src/app/models/mal-group';
import { MalDescriptionService } from 'src/app/service/mal-description.service';
import { MalGroupService } from 'src/app/service/mal-group.service';

@Component({
  selector: 'app-material-descriptions',
  standalone: true,
  imports: [AlertModule, GridModule, FormModule, CardModule, TableModule,
    UtilitiesModule, HttpClientModule,TextColorDirective, ReactiveFormsModule, 
    TableDirective, ModalModule, ButtonModule, NgTemplateOutlet,
    NgFor, NgIf, FormsModule, CommonModule],
  providers: [MalGroupService, MalDescriptionService, NgModel],
  templateUrl: './material-descriptions.component.html',
  styleUrl: './material-descriptions.component.scss'
})
export class MaterialDescriptionsComponent implements OnInit {
  // Filitreleme değerleri//
  malGroups: MalGroup[] = [];
  malDescription: MalDescription[] = [];
  public filteredData: any[] = [];
  public MalGroupNameFilter: string = '';
  public MalDescriptionNameFilter: string = '';

  // Tablodan data seçme degerleri //
  selectedMalDescription?: string | null = null;

  // Ekleme işlemi değerleri //
  public visible = false;
  malDescriptionForm: FormGroup;

  // Güncelleme İşlemi değerleri //
  isEditMode = false;

  // Güncelleme Modal değerleri //
  submitted = false;

  // Silme işlemi değerleri
  malDescriptionToDelete?: MalDescription | null = null;
  isDeleteModalVisible: boolean = false;
  userAnswer: number | null = null;
  isCorrectAnswer = false;
  randomNumber1!: number;
  randomNumber2!: number;
  randomOperator!: string;
  correctAnswer!: number;

  constructor(private malDescriptionService: MalDescriptionService, private malGroupService: MalGroupService, private formBuilder: FormBuilder) {
    this.malDescriptionForm = this.formBuilder.group({
      id: [''],
      malGroupId: ['', Validators.required],
      name: ['', Validators.required],
      code: ['', Validators.required],
      description: ['', Validators.required]
    });
    this.malGroupService.getMalGroup(0, 10).subscribe((response: any) => { this.malGroups = response.items; });
    this.generateRandomQuestion();
  }

  ngOnInit() {

    this.loadData();

  }

  // Tablodan data seçme Foksiyonları //
  selectMalDescription(malDescription: MalDescription): void {
    this.selectedMalDescription = this.selectedMalDescription === malDescription.id ? null : malDescription.id;
    console.log('Seçilen Malzeme Tipi ID:', this.selectedMalDescription);
    console.log('Tıklanan Malzeme Tipi ID:', malDescription.id);
  }

  trackById(index: number, item: MalDescription): string {
    // Eğer item.id undefined ise, boş bir string döndür
    return item.id ?? '';
  }

  // Filtreleme Foksiyonları
  loadData(): void {
    this.malDescriptionService.getMalDescription(0, 10).subscribe((response: any) => {
      this.malDescription = response.items; // Servisten dönen items listesini malDescription'e aktarıyoruz
      this.filteredData = response.items;
      this.filterData();
    })
  }

  filterData(): void {
    this.filteredData = this.malDescription.filter(item => {
      const matchesName = this.MalGroupNameFilter
        ? item.malGroupName?.toLowerCase().includes(this.MalGroupNameFilter.toLowerCase())
        : true;

      const matchesCode = this.MalDescriptionNameFilter
        ? item.name?.toLowerCase().includes(this.MalDescriptionNameFilter.toLowerCase())
        : true;

      return matchesName && matchesCode;
    });
  }

  filterClean(): void {
    this.MalGroupNameFilter = '';
    this.MalDescriptionNameFilter = '';
    this.loadData();
  }

  // ⚡ Ekleme işlemi foksiyonları ⚡//
  toggleNewMalDescriptionModal() {
    this.visible = !this.visible;  // Modal'ın görünürlüğünü değiştiriyoruz
    this.malDescriptionForm.reset();
  }

  // ⚡ Ekleme modal işlemi foksiyonları ⚡//
  saveNewMalDescription(): void {
    if (this.malDescriptionForm.valid) {
      const newMalDescription = this.malDescriptionForm.value; // Formdaki veriyi alıyoruz

      this.malDescriptionService.addMalDescription(newMalDescription).subscribe(
        (response) => {
          console.log('Yeni Malzeme Tipi Eklendi:', response);
          this.malDescription.push(response); // Listeye ekliyoruz
          this.visible = false; // Modal'ı kapatıyoruz
          this.malDescriptionForm.reset(); // Formu sıfırlıyoruz
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
  editMalDescription(): void {
    if (this.selectedMalDescription) {
      this.malDescriptionService.getMalDescriptionById(this.selectedMalDescription).subscribe((response: MalDescription) => {
        // API'den gelen veriyi forma aktarıyoruz
        this.malDescriptionForm.patchValue({
          id: response.id,
          malGroupId: response.malGroupId,
          name: response.name,
          code: response.code,
          description: response.description,
        });
        this.isEditMode = true; // Düzenleme modunu aktif ediyoruz
      });
    }
  }

  // ⚡ Güncelleme modal işlemi foksiyonları ⚡//
  onSubmit() {
    this.submitted = true;

    if (this.malDescriptionForm.invalid) {
      return;  // Hatalı form ise işlem yapma
    }

    // Form verilerini işleme
    console.log(this.malDescriptionForm.value);
  }

  saveChanges(): void {
    if (this.malDescriptionForm.valid) {
      // Formun değerlerini JSON string formatında alıyoruz
      const updatedMalDescriptionJson: string = JSON.stringify(this.malDescriptionForm.value);

      this.malDescriptionService.updateMalDescription(this.selectedMalDescription!, updatedMalDescriptionJson).subscribe((response) => {
        console.log('Güncelleme başarılı:', response);
        // Güncellenen malzeme tipini listeye yansıtıyoruz
        this.malDescription = this.malDescription.map((malDescription) =>
          malDescription.id === this.selectedMalDescription ? { ...malDescription, ...this.malDescriptionForm.value } : malDescription
        );
        this.isEditMode = false; // Düzenleme modunu kapatıyoruz
        this.malDescriptionForm.reset();
        this.loadData();
      });
    }
  }

  openAddMalDescriptionModal(): void {
    this.isEditMode = false; // Düzenleme modu değil
    this.malDescriptionForm.reset(); // Formu sıfırlıyoruz

  }


  // ⚡ Silme işlemi foksiyonları ⚡//
  deleteConfirmation(selectedId: string | null): void {
    if (selectedId) {
      this.malDescriptionToDelete =
        this.malDescription.find((malDescription) => malDescription.id === selectedId) || null;
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
    if (this.isCorrectAnswer && this.malDescriptionToDelete) {
      this.malDescriptionService.deleteMalDescription(this.malDescriptionToDelete.id!).subscribe(
        () => {
          this.malDescription = this.malDescription.filter(
            (malDescription) => malDescription.id !== this.malDescriptionToDelete?.id
          );
          this.malDescriptionToDelete = null;
          this.selectedMalDescription = null;
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
    this.malDescriptionToDelete = null; // Silme işlemini iptal et

  }
}
