export interface Person {
  id: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  street_address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  created_at: string;
  updated_at: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  members: string[];
}

export interface PeopleGroup {
  id: string;
  group_id: string;
  person_id: string;
  created_at: string;
} 