import { Component } from '@angular/core';
import { AuthService } from '../../core/auth';

interface CareerPreview {
  title: string;
  field: string;
  symbol: string;
  color: string;
}

@Component({
  selector: 'app-home-page',
  templateUrl: './home.html',
  standalone: false,
})
export class HomePage {
  readonly careers: CareerPreview[] = [
    { title: '안전·공공 지킴이', field: '안전과 공동체', symbol: '🧯', color: '#e9846e' },
    { title: '운동·체육 전문가', field: '움직임과 건강', symbol: '🏃', color: '#74c6b1' },
    { title: '경영·리더', field: '기획과 운영', symbol: '🧭', color: '#f2c14e' },
    { title: '과학·연구자', field: '탐구와 발견', symbol: '🔬', color: '#aa91d4' },
    { title: '엔지니어·개발자', field: '기술과 설계', symbol: '⚙️', color: '#74c6b1' },
    { title: '금융 전문가', field: '돈과 선택', symbol: '🪙', color: '#f2c14e' },
    { title: '법률 전문가', field: '약속과 공정', symbol: '⚖️', color: '#aa91d4' },
    { title: '교육·봉사자', field: '배움과 나눔', symbol: '📚', color: '#e9846e' },
    { title: '요리·셰프', field: '음식과 발견', symbol: '🍳', color: '#f2c14e' },
    { title: '환경·자연 전문가', field: '자연과 돌봄', symbol: '🌿', color: '#74c6b1' },
    { title: '예술가·크리에이터', field: '표현과 상상', symbol: '🎨', color: '#aa91d4' },
    { title: '기자·방송인', field: '이야기와 소통', symbol: '🎙️', color: '#e9846e' },
    { title: '패션·뷰티 전문가', field: '스타일과 표현', symbol: '👗', color: '#aa91d4' },
  ];

  constructor(readonly auth: AuthService) {}
}
