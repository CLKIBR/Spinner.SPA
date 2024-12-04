export interface User {
    id: number;               // Kullanıcının benzersiz ID'si
    username: string;         // Kullanıcı adı
    email: string;            // E-posta adresi
    firstName: string;        // Kullanıcının adı
    lastName: string;         // Kullanıcının soyadı
    password?: string;        // Parola (sadece kayıtta olabilir, login işleminde kullanılmaz)
    role: string;             // Kullanıcı rolü (Admin, User, vb.)
    isActive: boolean;        // Kullanıcı aktif mi? (Evet/Hayır)
    dateCreated: Date;        // Hesabın oluşturulma tarihi
    dateUpdated?: Date;       // Hesabın son güncellenme tarihi (isteğe bağlı)
    lastLogin?: Date;         // Son giriş tarihi (isteğe bağlı)
    profilePicture?: string;  // Kullanıcı profil resmi (isteğe bağlı)
    refreshToken?: string;    // Yenileme token'ı (isteğe bağlı)
  }