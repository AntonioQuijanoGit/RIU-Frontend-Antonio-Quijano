import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeroDeleteDialogComponent } from './hero-delete-dialog.component';

describe('HeroDeleteDialogComponent', () => {
  let component: HeroDeleteDialogComponent;
  let fixture: ComponentFixture<HeroDeleteDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroDeleteDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeroDeleteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
