import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'button[moocow]',
  templateUrl: './cow.component.html',
  styleUrls: ['./cow.component.scss']
})
export class CowComponent {
  @ViewChild('moo', { static: true }) private readonly moo!: ElementRef<HTMLAudioElement>;

  play(): void {
    const audioElement = this.moo.nativeElement;
    audioElement.currentTime = 0;

    audioElement.play();
  }
}
