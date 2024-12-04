import { CommonModule, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, NgModel, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertModule, AvatarComponent, ButtonModule, CardModule, FormModule, GridModule, ModalModule, ProgressBarDirective, ProgressComponent, TableDirective, TableModule, TextColorDirective, UtilitiesModule } from '@coreui/angular';
import { AlertifyService } from './../../../service/alertify.service';
import { MalNumber } from 'src/app/models/mal-number';
import { MalGroup } from 'src/app/models/mal-group';
import { MalDescription } from 'src/app/models/mal-description';
import { MalNumberService } from 'src/app/service/mal-number.service';
import { MalGroupService } from 'src/app/service/mal-group.service';
import { MalDescriptionService } from 'src/app/service/mal-description.service';

@Component({
  selector: 'app-material-number-definitions',
  imports: [AlertModule, GridModule, FormModule, CardModule, TableModule,
    UtilitiesModule, ProgressComponent, HttpClientModule,
    TextColorDirective, ReactiveFormsModule, ProgressBarDirective,
    ProgressComponent, TableDirective, ModalModule, ButtonModule, NgTemplateOutlet,
    NgFor, NgIf, FormsModule, CommonModule],
  providers: [MalGroupService, MalNumberService, MalDescriptionService, NgModel],
  templateUrl: './material-number-definitions.component.html',
  styleUrl: './material-number-definitions.component.scss'
})
export class MaterialNumberDefinitionsComponent implements OnInit {
  // Filitreleme değerleri//
  malGroups: MalGroup[] = [];
  malDescriptions: MalDescription[] = [];
  malNumbers: MalNumber[] = [];
  malGroupName: any = null;
  public filteredData: any[] = [];
  public filteredDescriptionData: any[] = [];
  public MalGroupNameFilter: string = '';
  public MalDescriptionCodeFilter: string = '';
  public MalNumberNameFilter: string = '';

  selectedMalGroup: any = null; // Seçilen veri burada tutulacak
  selectedMalDescription: any = null;
  filteredItems: MalDescription[] = [];
  selectedCode: string | undefined;

  // Tablodan data seçme degerleri //
  selectedMalNumber?: string | null = null;

  // Ekleme işlemi değerleri //
  public visible = false;
  malNumberForm: FormGroup;

  // Güncelleme İşlemi değerleri //
  isEditMode = false;

  // Güncelleme Modal değerleri //
  submitted = false;

  // Silme işlemi değerleri
  malNumberToDelete?: MalNumber | null = null;
  isDeleteModalVisible: boolean = false;
  userAnswer: number | null = null;
  isCorrectAnswer = false;
  randomNumber1!: number;
  randomNumber2!: number;
  randomOperator!: string;
  correctAnswer!: number;

  constructor(
    private malNumberService: MalNumberService,
    private malGroupService: MalGroupService,
    private formBuilder: FormBuilder,
    private alertifyService: AlertifyService,
    private malDescriptionService: MalDescriptionService) {
    this.malNumberForm = this.formBuilder.group({
      id: [''],
      malGroupId: ['', Validators.required],
      malDescriptionId: ['', Validators.required],
      name: ['', Validators.required],
      amount: ['', Validators.required],
      description: ['', Validators.required]
    });
    this.malGroupService.getMalGroup(0, 10).subscribe((response: any) => { this.malGroups = response.items; });
    this.malDescriptionService.getMalDescription(0, 10).subscribe((response: any) => { this.malDescriptions = response.items; });

    this.generateRandomQuestion();
  }

  ngOnInit() {

    this.loadData();

  }

  // Tablodan data seçme Foksiyonları //
  selectMalNumber(malNumber: MalNumber): void {
    this.selectedMalNumber = this.selectedMalNumber === malNumber.id ? null : malNumber.id;
  }

  trackById(index: number, item: MalNumber): string {
    // Eğer item.id undefined ise, boş bir string döndür
    return item.id ?? '';
  }

  // Filtreleme Foksiyonları
  loadData(): void {
    this.malNumberService.getMalNumber(0, 10).subscribe((response: any) => {
      this.malNumbers = response.items; // Servisten dönen items listesini malNumber'e aktarıyoruz
      this.filteredData = response.items;
      this.filterData();
    })
  }

  onMalGroupChange(event: Event): void {
    const selectedId = (event.target as HTMLSelectElement).value;
    this.selectedMalGroup = this.malGroups.find(group => group.id === selectedId);

    if (this.selectedMalGroup) {
      this.filteredItems = this.malDescriptions.filter(item => item.malGroupName === this.selectedMalGroup.name);
    } else {
      this.filteredItems = [];
    }
    if (this.filteredItems.length > 0) {
      this.malNumberForm.get('malDescriptionId')?.setValue(this.filteredItems[0].id);
      this.selectedCode = this.filteredItems[0].code;
    } else {
      this.selectedCode = '';
    }
  }

  filterData(): void {
    this.filteredData = this.malNumbers.filter(item => {
      const matchesGroupName = this.MalGroupNameFilter
        ? item.malGroupName?.toLowerCase().includes(this.MalGroupNameFilter.toLowerCase())
        : true;

      const matchesNumberName = this.MalNumberNameFilter
        ? item.name?.toString().toLowerCase().includes(this.MalNumberNameFilter.toLowerCase())
        : true;

      const matchesDescriptionCode = this.MalDescriptionCodeFilter
        ? item.malDescriptionCode?.toLowerCase().includes(this.MalDescriptionCodeFilter.toLowerCase())
        : true;

      return matchesGroupName && matchesDescriptionCode && matchesNumberName;
    });
  }
  filterClean(): void {
    this.MalGroupNameFilter = '';
    this.MalDescriptionCodeFilter = '';
    this.MalNumberNameFilter = '';
    this.loadData();
  }

  // ⚡ Ekleme işlemi foksiyonları ⚡//
  toggleNewMalNumberModal() {
    this.visible = !this.visible;  // Modal'ın görünürlüğünü değiştiriyoruz
    this.malNumberForm.reset();
  }

  // ⚡ Ekleme modal işlemi foksiyonları ⚡//
  saveNewMalNumber(): void {
    if (this.malNumberForm.valid) {
      const newMalNumber = this.malNumberForm.value; // Formdaki veriyi alıyoruz

      this.malNumberService.addMalNumber(newMalNumber).subscribe(
        (response) => {
          console.log('Yeni Malzeme Tipi Eklendi:', response);
          this.malNumbers.push(response); // Listeye ekliyoruz
          this.visible = false; // Modal'ı kapatıyoruz
          this.malNumberForm.reset(); // Formu sıfırlıyoruz
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
  editMalNumber(): void {
    if (this.selectedMalNumber) {
      this.malNumberService.getMalNumberById(this.selectedMalNumber).subscribe((response: MalNumber) => {
        // API'den gelen veriyi forma aktarıyoruz
        this.malNumberForm.patchValue({
          id: response.id,
          malGroupId: response.malGroupId,
          malDescriptionId: response.malDescriptionId,
          name: response.name,
          amount: response.amount,
          description: response.description
        });
        this.isEditMode = true; // Düzenleme modunu aktif ediyoruz
      });
    }
  }

  // ⚡ Güncelleme modal işlemi foksiyonları ⚡//
  onSubmit() {
    this.submitted = true;

    if (this.malNumberForm.invalid) {
      return;  // Hatalı form ise işlem yapma
    }

    // Form verilerini işleme
    console.log(this.malNumberForm.value);
  }

  saveChanges(): void {
    if (this.malNumberForm.valid) {
      // Formun değerlerini JSON string formatında alıyoruz
      const updatedMalNumberJson: string = JSON.stringify(this.malNumberForm.value);

      this.malNumberService.updateMalNumber(this.selectedMalNumber!, updatedMalNumberJson).subscribe((response) => {
        console.log('Güncelleme başarılı:', response);
        // Güncellenen malzeme tipini listeye yansıtıyoruz
        this.malNumbers = this.malNumbers.map((malNumber) =>
          malNumber.id === this.selectedMalNumber ? { ...malNumber, ...this.malNumberForm.value } : malNumber
        );
        this.isEditMode = false; // Düzenleme modunu kapatıyoruz
        this.malNumberForm.reset();
        this.loadData();
      });
    }
  }

  openAddMalNumberModal(): void {
    this.isEditMode = false; // Düzenleme modu değil
    this.malNumberForm.reset(); // Formu sıfırlıyoruz

  }


  // ⚡ Silme işlemi foksiyonları ⚡//
  deleteConfirmation(selectedId: string | null): void {
    if (selectedId) {
      this.malNumberToDelete =
        this.malNumbers.find((malNumber) => malNumber.id === selectedId) || null;
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
    if (this.isCorrectAnswer && this.malNumberToDelete) {
      this.malNumberService.deleteMalNumber(this.malNumberToDelete.id!).subscribe(
        () => {
          this.malNumbers = this.malNumbers.filter(
            (malNumber) => malNumber.id !== this.malNumberToDelete?.id
          );
          this.malNumberToDelete = null;
          this.selectedMalNumber = null;
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
    this.malNumberToDelete = null; // Silme işlemini iptal et

  }
}
