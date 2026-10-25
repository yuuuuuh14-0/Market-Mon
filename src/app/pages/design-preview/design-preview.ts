import { Component, OnDestroy, OnInit, signal } from '@angular/core';

interface FontOption {
  id: string;
  name: string;
  description: string;
  family: string;
}

@Component({
  selector: 'app-design-preview-page',
  templateUrl: './design-preview.html',
  styleUrl: './design-preview.less',
  standalone: false,
})
export class DesignPreviewPage implements OnInit, OnDestroy {
  readonly selectedFont = signal('pretendard');
  readonly fontOptions: FontOption[] = [
    { id: 'pretendard', name: 'Pretendard', description: '단단하고 간결한 인상의 UI 고딕', family: '"Pretendard Variable", sans-serif' },
    { id: 'suit', name: 'SUIT', description: '담백하고 균형 잡힌 화면용 고딕', family: '"SUIT Variable", sans-serif' },
    { id: 'gmarket', name: 'Gmarket Sans', description: '제목에 개성과 힘을 더하는 고딕', family: '"Gmarket Sans", sans-serif' },
  ];

  private readonly fontStylesheetUrls = [
    'https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css',
    'https://cdn.jsdelivr.net/gh/sun-typeface/SUIT@2/fonts/variable/woff2/SUIT-Variable.css',
    'https://cdn.jsdelivr.net/gh/fonts-archive/GmarketSans/GmarketSans.css',
  ];
  private readonly fontStylesheets: HTMLLinkElement[] = [];

  ngOnInit(): void {
    for (const href of this.fontStylesheetUrls) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.dataset['marketMonFontPreview'] = 'true';
      document.head.appendChild(link);
      this.fontStylesheets.push(link);
    }
  }

  ngOnDestroy(): void {
    for (const link of this.fontStylesheets) link.remove();
  }
}
