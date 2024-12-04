import { CommonModule, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, NgModel, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertModule, AvatarComponent, ButtonModule, CardModule, FormModule, GridModule, ModalModule, ProgressBarDirective, ProgressComponent, TableDirective, TableModule, TextColorDirective, UtilitiesModule } from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { MalCollection } from 'src/app/models/mal-collection';
import { MalGroup } from 'src/app/models/mal-group';
import { MalCollectionService } from 'src/app/service/mal-collection-service';
import { MalGroupService } from 'src/app/service/mal-group.service';

@Component({
  selector: 'app-material-collection-definitions',
  templateUrl: './material-collection-descriptions-component.html',
  styleUrl: './material-collection-descriptions-component.scss',
  standalone: true,
  imports: [AlertModule, GridModule, FormModule, CardModule, TableModule,
    UtilitiesModule, ProgressComponent, HttpClientModule,
    TextColorDirective, ReactiveFormsModule, ProgressBarDirective,
    ProgressComponent, TableDirective, ModalModule, ButtonModule, NgTemplateOutlet,
    NgFor, NgIf, FormsModule, CommonModule ],
  providers: [MalGroupService, MalCollectionService, NgModel]
})

export class MaterialClassDefinitionsComponent implements OnInit{
  
  // Filitreleme değerleri//
  malGroups: MalGroup[] = [];
  malCollection: MalCollection[] = [];
  public filteredData: any[] = []; 
  public MalGroupNameFilter: string = ''; 
  public MalCollectionNameFilter: string = ''; 

  // Tablodan data seçme degerleri //
  selectedMalCollection?: string | null = null;

  // Ekleme işlemi değerleri //
  public visible = false;
  malCollectionForm: FormGroup;

  // Güncelleme İşlemi değerleri //
  isEditMode = false;

  // Güncelleme Modal değerleri //
  submitted = false;

  // Silme işlemi değerleri
  malCollectionToDelete?: MalCollection | null = null;
  isDeleteModalVisible: boolean = false;
  userAnswer: number | null = null;
  isCorrectAnswer = false;
  randomNumber1!: number;
  randomNumber2!: number;
  randomOperator!: string;
  correctAnswer!: number;

  constructor(private malCollectionService: MalCollectionService,private malGroupService: MalGroupService, private formBuilder: FormBuilder) {
    this.malCollectionForm = this.formBuilder.group({
      id: [''],
      malGroupId: ['', Validators.required],
      name: ['', Validators.required],
      code: ['', Validators.required],
      amount: ['', Validators.required],
      description: ['', Validators.required],
      url: ['', Validators.required]
    });
    this.malGroupService.getMalGroup(0, 10).subscribe((response: any) => {this.malGroups = response.items;});
    this.generateRandomQuestion();
  }

  ngOnInit() {
    
    this.loadData();

  }

  // Tablodan data seçme Foksiyonları //
  selectMalCollection(malCollection: MalCollection): void {
    this.selectedMalCollection = this.selectedMalCollection === malCollection.id ? null : malCollection.id;
    console.log('Seçilen Malzeme Tipi ID:', this.selectedMalCollection);
    console.log('Tıklanan Malzeme Tipi ID:', malCollection.id);
  }

  trackById(index: number, item: MalCollection): string {
    // Eğer item.id undefined ise, boş bir string döndür
    return item.id ?? '';
  }

  // Filtreleme Foksiyonları
  loadData(): void {
    this.malCollectionService.getMalCollection(0, 10).subscribe((response: any) => {
      this.malCollection = response.items; // Servisten dönen items listesini malCollection'e aktarıyoruz
      this.filteredData = response.items;
      this.filterData();
    })
  }

  filterData(): void {
    this.filteredData = this.malCollection.filter(item => {
      const matchesName = this.MalGroupNameFilter
        ? item.malGroupName?.toLowerCase().includes(this.MalGroupNameFilter.toLowerCase())
        : true;

      const matchesCode = this.MalCollectionNameFilter
        ? item.name?.toLowerCase().includes(this.MalCollectionNameFilter.toLowerCase())
        : true;

      return matchesName && matchesCode;
    });
  }

  filterClean(): void {
    this.MalGroupNameFilter = '';
    this.MalCollectionNameFilter = '';
    this.loadData();
  }

  // ⚡ Ekleme işlemi foksiyonları ⚡//
  toggleNewMalCollectionModal() {
    this.visible = !this.visible;  // Modal'ın görünürlüğünü değiştiriyoruz
    this.malCollectionForm.reset();
  }

  // ⚡ Ekleme modal işlemi foksiyonları ⚡//
  saveNewMalCollection(): void {
    if (this.malCollectionForm.valid) {
      const newMalCollection = this.malCollectionForm.value; // Formdaki veriyi alıyoruz

      this.malCollectionService.addMalCollection(newMalCollection).subscribe(
        (response) => {
          console.log('Yeni Malzeme Tipi Eklendi:', response);
          this.malCollection.push(response); // Listeye ekliyoruz
          this.visible = false; // Modal'ı kapatıyoruz
          this.malCollectionForm.reset(); // Formu sıfırlıyoruz
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
  editMalCollection(): void {
    if (this.selectedMalCollection) {
      this.malCollectionService.getMalCollectionById(this.selectedMalCollection).subscribe((response: MalCollection) => {
        // API'den gelen veriyi forma aktarıyoruz
        this.malCollectionForm.patchValue({
          id: response.id,
          malGroupId: response.malGroupId,
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

    if (this.malCollectionForm.invalid) {
      return;  // Hatalı form ise işlem yapma
    }

    // Form verilerini işleme
    console.log(this.malCollectionForm.value);
  }

  saveChanges(): void {
    if (this.malCollectionForm.valid) {
      // Formun değerlerini JSON string formatında alıyoruz
      const updatedMalCollectionJson: string = JSON.stringify(this.malCollectionForm.value);

      this.malCollectionService.updateMalCollection(this.selectedMalCollection!, updatedMalCollectionJson).subscribe((response) => {
        console.log('Güncelleme başarılı:', response);
        // Güncellenen malzeme tipini listeye yansıtıyoruz
        this.malCollection = this.malCollection.map((malCollection) =>
          malCollection.id === this.selectedMalCollection ? { ...malCollection, ...this.malCollectionForm.value } : malCollection
        );
        this.isEditMode = false; // Düzenleme modunu kapatıyoruz
        this.malCollectionForm.reset();
        this.loadData();
      });
    }
  }

  openAddMalCollectionModal(): void {
    this.isEditMode = false; // Düzenleme modu değil
    this.malCollectionForm.reset(); // Formu sıfırlıyoruz

  }
  

  // ⚡ Silme işlemi foksiyonları ⚡//
  deleteConfirmation(selectedId: string | null): void {
    if (selectedId) {
      this.malCollectionToDelete =
        this.malCollection.find((malCollection) => malCollection.id === selectedId) || null;
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
    if (this.isCorrectAnswer && this.malCollectionToDelete) {
      this.malCollectionService.deleteMalCollection(this.malCollectionToDelete.id!).subscribe(
        () => {
          this.malCollection = this.malCollection.filter(
            (malCollection) => malCollection.id !== this.malCollectionToDelete?.id
          );
          this.malCollectionToDelete = null;
          this.selectedMalCollection = null;
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
    this.malCollectionToDelete = null; // Silme işlemini iptal et

  }


}
