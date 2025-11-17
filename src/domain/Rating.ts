export class Rating {
  readonly value: number;
  readonly comment: string;
  readonly date: Date;

  constructor(value: number, comment: string, date: Date) {
    if (value < 1 || value > 5) {
      throw new Error("Rating value must be between 1 and 5.");
    }
    this.value = value;
    this.comment = comment;
    this.date = date;
  }
}
