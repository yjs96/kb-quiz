# Quiz Mastermind

1. 모바일 퀴즈 페이지

2. shadcn, tailwind css, pretendard font, 모던한 디자인

3. 상단에 정답 수 / 전체 문제, 현재 정답 확률 계속 표시

4. JSON 문제 랜덤하게 출제

5. 한번에 한문제씩

6. 보기 선택 후 제출 클릭 시 답변 여부, 정답표시, 해석 표시

7. JSON 예시:[

    {

        "evaluation_type": "1차평가",

        "question": "가격은 소유하거나 사용하게 된 상품이나 서비스가 제공하는 혜택을 교환하는 대가로 소비자가 지불하는 가치의 총합이다.",

        "choices": [

            "1. O",

            "2. X"

        ],

        "answer": 1,

        "explanation": "가격은 소유하거나 사용하게 된 상품이나 서비스가 제공하는 혜택을 교환하는 대가로 소비자가 지불하는 가치의 총합이다.",

        "source": "1권 146p"

    },

    {

        "evaluation_type": "1차평가",

        "question": "소비자 행동은 소비자들이 언제, 어디서, 무엇을, 어떻게, 왜 그런 행동을 하는지, 그리고 얼마나 자주, 얼마나 오랫동안 특정 상품이나 서비스를 구매, 사용, 처분할 것인지와 관련된 모든 의사결정 과정을 말한다.",

        "choices": [

            "1. O",

            "2. X"

        ],

        "answer": 1,

        "explanation": "소비자 행동이란 소비자들이 언제, 어디서, 무엇을, 어떻게, 왜 그런 행동을 하는지, 그리고 얼마나 자주, 얼마나 오랫동안 특정 상품이나 서비스를 구매, 사용, 처분할 것인지와 관련된 모든 의사결정 과정을 말한다.",

        "source": "1권 24p"

    }]

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
