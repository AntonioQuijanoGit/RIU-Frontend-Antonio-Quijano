import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  private timeoutId: any = null;

  public isLoading$: Observable<boolean> = this.isLoadingSubject.asObservable();

  show(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this.isLoadingSubject.next(true);

    this.timeoutId = setTimeout(() => {
      this.hide();
    }, 3000);
  }

  hide(): void {
    this.isLoadingSubject.next(false);

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}
