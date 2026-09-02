import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypePersonalComponent } from './type-personal.component';

describe('TypePersonalComponent', () => {
  let component: TypePersonalComponent;
  let fixture: ComponentFixture<TypePersonalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypePersonalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TypePersonalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
