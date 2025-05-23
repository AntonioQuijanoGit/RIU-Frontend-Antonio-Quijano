import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private isLoadingSignal = signal<boolean>(false);
  private timeoutId: any = null;

  public readonly isLoading = this.isLoadingSignal.asReadonly();

  show(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this.isLoadingSignal.set(true);

    this.timeoutId = setTimeout(() => {
      this.hide();
    }, 2000);
  }

  hide(): void {
    this.isLoadingSignal.set(false);

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  isCurrentlyLoading(): boolean {
    return this.isLoading();
  }
}
