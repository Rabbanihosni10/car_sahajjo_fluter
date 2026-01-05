class User {
  final String id;
  final String name;
  final String email;
  final String phone;
  final String role;
  final String? profilePhoto;
  final Address? address;
  final KycDetails? kycDetails;
  final bool isApproved;
  final String approvalStatus;
  final DriverDetails? driverDetails;
  final OwnerDetails? ownerDetails;
  final VendorDetails? vendorDetails;
  final bool isActive;
  final Preferences? preferences;

  User({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    required this.role,
    this.profilePhoto,
    this.address,
    this.kycDetails,
    required this.isApproved,
    required this.approvalStatus,
    this.driverDetails,
    this.ownerDetails,
    this.vendorDetails,
    required this.isActive,
    this.preferences,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['_id'] ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      phone: json['phone'] ?? '',
      role: json['role'] ?? 'owner',
      profilePhoto: json['profilePhoto'],
      address: json['address'] != null ? Address.fromJson(json['address']) : null,
      kycDetails: json['kycDetails'] != null ? KycDetails.fromJson(json['kycDetails']) : null,
      isApproved: json['isApproved'] ?? false,
      approvalStatus: json['approvalStatus'] ?? 'pending',
      driverDetails: json['driverDetails'] != null ? DriverDetails.fromJson(json['driverDetails']) : null,
      ownerDetails: json['ownerDetails'] != null ? OwnerDetails.fromJson(json['ownerDetails']) : null,
      vendorDetails: json['vendorDetails'] != null ? VendorDetails.fromJson(json['vendorDetails']) : null,
      isActive: json['isActive'] ?? true,
      preferences: json['preferences'] != null ? Preferences.fromJson(json['preferences']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'name': name,
      'email': email,
      'phone': phone,
      'role': role,
      'profilePhoto': profilePhoto,
      'address': address?.toJson(),
      'kycDetails': kycDetails?.toJson(),
      'isApproved': isApproved,
      'approvalStatus': approvalStatus,
      'driverDetails': driverDetails?.toJson(),
      'ownerDetails': ownerDetails?.toJson(),
      'vendorDetails': vendorDetails?.toJson(),
      'isActive': isActive,
      'preferences': preferences?.toJson(),
    };
  }
}

class Address {
  final String? street;
  final String? city;
  final String? state;
  final String? zipCode;
  final String? country;

  Address({this.street, this.city, this.state, this.zipCode, this.country});

  factory Address.fromJson(Map<String, dynamic> json) {
    return Address(
      street: json['street'],
      city: json['city'],
      state: json['state'],
      zipCode: json['zipCode'],
      country: json['country'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'street': street,
      'city': city,
      'state': state,
      'zipCode': zipCode,
      'country': country,
    };
  }
}

class KycDetails {
  final String? idType;
  final String? idNumber;
  final String? idDocument;
  final String? licenseNumber;
  final String? licenseDocument;
  final DateTime? licenseExpiry;
  final bool verified;

  KycDetails({
    this.idType,
    this.idNumber,
    this.idDocument,
    this.licenseNumber,
    this.licenseDocument,
    this.licenseExpiry,
    required this.verified,
  });

  factory KycDetails.fromJson(Map<String, dynamic> json) {
    return KycDetails(
      idType: json['idType'],
      idNumber: json['idNumber'],
      idDocument: json['idDocument'],
      licenseNumber: json['licenseNumber'],
      licenseDocument: json['licenseDocument'],
      licenseExpiry: json['licenseExpiry'] != null ? DateTime.parse(json['licenseExpiry']) : null,
      verified: json['verified'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'idType': idType,
      'idNumber': idNumber,
      'idDocument': idDocument,
      'licenseNumber': licenseNumber,
      'licenseDocument': licenseDocument,
      'licenseExpiry': licenseExpiry?.toIso8601String(),
      'verified': verified,
    };
  }
}

class DriverDetails {
  final int? experience;
  final double rating;
  final int totalRatings;
  final bool availability;
  final double? hourlyRate;
  final double? dailyRate;
  final List<String>? languages;
  final List<String>? specializations;

  DriverDetails({
    this.experience,
    required this.rating,
    required this.totalRatings,
    required this.availability,
    this.hourlyRate,
    this.dailyRate,
    this.languages,
    this.specializations,
  });

  factory DriverDetails.fromJson(Map<String, dynamic> json) {
    return DriverDetails(
      experience: json['experience'],
      rating: (json['rating'] ?? 0).toDouble(),
      totalRatings: json['totalRatings'] ?? 0,
      availability: json['availability'] ?? true,
      hourlyRate: json['hourlyRate']?.toDouble(),
      dailyRate: json['dailyRate']?.toDouble(),
      languages: json['languages'] != null ? List<String>.from(json['languages']) : null,
      specializations: json['specializations'] != null ? List<String>.from(json['specializations']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'experience': experience,
      'rating': rating,
      'totalRatings': totalRatings,
      'availability': availability,
      'hourlyRate': hourlyRate,
      'dailyRate': dailyRate,
      'languages': languages,
      'specializations': specializations,
    };
  }
}

class OwnerDetails {
  final String? companyName;
  final String? taxId;
  final String? businessLicense;

  OwnerDetails({this.companyName, this.taxId, this.businessLicense});

  factory OwnerDetails.fromJson(Map<String, dynamic> json) {
    return OwnerDetails(
      companyName: json['companyName'],
      taxId: json['taxId'],
      businessLicense: json['businessLicense'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'companyName': companyName,
      'taxId': taxId,
      'businessLicense': businessLicense,
    };
  }
}

class VendorDetails {
  final String? businessName;
  final String? businessType;
  final String? taxId;

  VendorDetails({this.businessName, this.businessType, this.taxId});

  factory VendorDetails.fromJson(Map<String, dynamic> json) {
    return VendorDetails(
      businessName: json['businessName'],
      businessType: json['businessType'],
      taxId: json['taxId'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'businessName': businessName,
      'businessType': businessType,
      'taxId': taxId,
    };
  }
}

class Preferences {
  final NotificationPreferences? notifications;
  final bool darkMode;

  Preferences({this.notifications, required this.darkMode});

  factory Preferences.fromJson(Map<String, dynamic> json) {
    return Preferences(
      notifications: json['notifications'] != null 
          ? NotificationPreferences.fromJson(json['notifications']) 
          : null,
      darkMode: json['darkMode'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'notifications': notifications?.toJson(),
      'darkMode': darkMode,
    };
  }
}

class NotificationPreferences {
  final bool email;
  final bool sms;
  final bool push;

  NotificationPreferences({
    required this.email,
    required this.sms,
    required this.push,
  });

  factory NotificationPreferences.fromJson(Map<String, dynamic> json) {
    return NotificationPreferences(
      email: json['email'] ?? true,
      sms: json['sms'] ?? true,
      push: json['push'] ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'email': email,
      'sms': sms,
      'push': push,
    };
  }
}
