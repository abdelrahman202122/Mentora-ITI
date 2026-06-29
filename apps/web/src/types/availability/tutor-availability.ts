export interface TimeSlot {
  startTime: string;
  endTime: string;
}

export interface AvailabilityPayload {
  slots: {
    monday?: TimeSlot[];
    tuesday?: TimeSlot[];
    wednesday?: TimeSlot[];
    thursday?: TimeSlot[];
    friday?: TimeSlot[];
    saturday?: TimeSlot[];
    sunday?: TimeSlot[];
  };
  timezone: string;
}

export interface TutorAvailability {
  _id: string;
  tutorId: string;

  slots: {
    monday: TimeSlot[];
    tuesday: TimeSlot[];
    wednesday: TimeSlot[];
    thursday: TimeSlot[];
    friday: TimeSlot[];
    saturday: TimeSlot[];
    sunday: TimeSlot[];
  };

  timezone: string;
  updatedAt: string;
  __v: number;
}



export interface DailySlot {
  startAt: string;
  endAt: string;
}

export interface DailyAvailability {
  date: string;
  slots: DailySlot[];
}
export interface TutorAvailabilitySlots {
  tutorId: string;
  startDate: string;
  endDate: string;
  availability: DailyAvailability[];
}

export interface TutorAvailability {
  _id: string;
  tutorId: string;

  slots: {
    monday: TimeSlot[];
    tuesday: TimeSlot[];
    wednesday: TimeSlot[];
    thursday: TimeSlot[];
    friday: TimeSlot[];
    saturday: TimeSlot[];
    sunday: TimeSlot[];
  };

  updatedAt: string;
  __v: number;
}