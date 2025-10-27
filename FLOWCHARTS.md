# Browser Action Flowcharts

This document contains visual flowcharts showing how different browser actions work and interact with each other.

## Table of Contents

1. [Action Categories Overview](#action-categories-overview)
2. [Common Workflow Patterns](#common-workflow-patterns)
3. [Form Submission Flow](#form-submission-flow)
4. [Data Extraction Flow](#data-extraction-flow)
5. [Navigation Flow](#navigation-flow)
6. [Multi-Tab/Frame Flow](#multi-tabframe-flow)
7. [Error Handling Flow](#error-handling-flow)
8. [Complete Automation Flow](#complete-automation-flow)

---

## Action Categories Overview

```mermaid
graph TB
    A[47 Browser Actions] --> B[Basic Interactions<br/>6 actions]
    A --> C[Input & Forms<br/>9 actions]
    A --> D[File Operations<br/>2 actions]
    A --> E[Navigation<br/>4 actions]
    A --> F[Frame & Window<br/>3 actions]
    A --> G[Data Extraction<br/>9 actions]
    A --> H[Waiting<br/>4 actions]
    A --> I[Scrolling<br/>4 actions]
    A --> J[Screenshots<br/>2 actions]
    A --> K[Cookie Management<br/>2 actions]
    A --> L[Alert Handling<br/>2 actions]
    A --> M[Advanced<br/>1 action]

    B --> B1[navigate<br/>click<br/>double_click<br/>right_click<br/>hover<br/>drag_and_drop]
    C --> C1[type<br/>type_text<br/>clear_input<br/>focus<br/>press_key<br/>check/uncheck_checkbox<br/>select_dropdown<br/>select_text]
    D --> D1[upload_file<br/>download_file]
    E --> E1[go_back<br/>go_forward<br/>reload<br/>close_tab]
    F --> F1[switch_to_iframe<br/>switch_to_main_frame<br/>switch_to_new_tab]
    G --> G1[extract_text<br/>get_attribute<br/>get_title<br/>get_url<br/>element_exists<br/>is_visible<br/>get_element_count<br/>get_cookies<br/>get_alert_text]
    H --> H1[wait_for_element<br/>wait_for_navigation<br/>wait_for_timeout<br/>wait_for_url]
    I --> I1[scroll_to<br/>scroll_to_top<br/>scroll_to_bottom<br/>scroll_by]
    J --> J1[screenshot<br/>screenshot_element]
    K --> K1[set_cookie<br/>clear_cookies]
    L --> L1[accept_alert<br/>dismiss_alert]
    M --> M1[execute_javascript]
```

---

## Common Workflow Patterns

### Basic Page Interaction Pattern

```mermaid
flowchart TD
    Start([Start Automation]) --> Navigate[navigate to URL]
    Navigate --> Wait1[wait_for_element]
    Wait1 --> Verify{element_exists?}
    Verify -->|No| Error[Log Error]
    Verify -->|Yes| Visible{is_visible?}
    Visible -->|No| Scroll[scroll_to element]
    Visible -->|Yes| Interact[click/type/etc]
    Scroll --> Interact
    Interact --> Screenshot[screenshot]
    Screenshot --> End([End])
    Error --> End
```

### Wait Strategy Pattern

```mermaid
flowchart TD
    Action[Perform Action] --> WaitType{What to wait for?}
    WaitType -->|Element| WE[wait_for_element]
    WaitType -->|Navigation| WN[wait_for_navigation]
    WaitType -->|URL Change| WU[wait_for_url]
    WaitType -->|Fixed Time| WT[wait_for_timeout]
    WE --> Verify{Element ready?}
    WN --> Verify
    WU --> Verify
    WT --> Verify
    Verify -->|Yes| Continue[Continue workflow]
    Verify -->|No| Timeout[Handle timeout]
    Timeout --> Retry{Retry?}
    Retry -->|Yes| Action
    Retry -->|No| Fail[Fail]
```

---

## Form Submission Flow

```mermaid
flowchart TD
    Start([Navigate to Form]) --> WaitForm[wait_for_element: form]
    WaitForm --> Clear1[clear_input: field1]
    Clear1 --> Type1[type: value1]
    Type1 --> Clear2[clear_input: field2]
    Clear2 --> Type2[type: value2]
    Type2 --> Dropdown[select_dropdown]
    Dropdown --> Checkbox[check_checkbox: terms]
    Checkbox --> Upload{File upload?}
    Upload -->|Yes| UploadFile[upload_file]
    Upload -->|No| Validate
    UploadFile --> Validate{Validate form?}
    Validate -->|Yes| GetValues[extract_text: fields]
    Validate -->|No| Submit
    GetValues --> Verify{Values correct?}
    Verify -->|No| Fix[Fix values]
    Verify -->|Yes| Submit
    Fix --> Type1
    Submit[click: submit button] --> WaitNav[wait_for_navigation]
    WaitNav --> CheckSuccess{element_exists: success?}
    CheckSuccess -->|Yes| ScreenSuccess[screenshot]
    CheckSuccess -->|No| CheckError{element_exists: error?}
    CheckError -->|Yes| ScreenError[screenshot_element: error]
    CheckError -->|No| Timeout
    ScreenSuccess --> End([Success])
    ScreenError --> End
    Timeout[wait_for_timeout] --> End
```

---

## Data Extraction Flow

```mermaid
flowchart TD
    Start([Start Extraction]) --> Nav[navigate to page]
    Nav --> WaitLoad[wait_for_element]
    WaitLoad --> GetMeta1[get_title]
    GetMeta1 --> GetMeta2[get_url]
    GetMeta2 --> Count[get_element_count: items]
    Count --> Loop{More items?}
    Loop -->|Yes| ScrollItem[scroll_to: next item]
    ScrollItem --> CheckVis{is_visible?}
    CheckVis -->|No| ScrollItem
    CheckVis -->|Yes| ExtractText[extract_text]
    ExtractText --> GetAttr[get_attribute: href/src]
    GetAttr --> ScreenElem[screenshot_element]
    ScreenElem --> NextItem{Next item?}
    NextItem -->|Yes| Loop
    NextItem -->|No| FullScreen[screenshot: full page]
    Loop -->|No| FullScreen
    FullScreen --> SaveData[Save extracted data]
    SaveData --> CheckNext{Next page?}
    CheckNext -->|Yes| Click[click: next button]
    Click --> WaitLoad
    CheckNext -->|No| End([Complete])
```

---

## Navigation Flow

```mermaid
flowchart TD
    Start([Start]) --> CurrentPage[On Page A]
    CurrentPage --> Action{Navigation Action?}

    Action -->|navigate| NewURL[navigate: URL]
    Action -->|click link| ClickLink[click: link]
    Action -->|go_back| Back[go_back]
    Action -->|go_forward| Forward[go_forward]
    Action -->|reload| Reload[reload]

    NewURL --> WaitNav1[wait_for_navigation]
    ClickLink --> WaitNav1
    Back --> WaitNav1
    Forward --> WaitNav1
    Reload --> WaitNav1

    WaitNav1 --> Loaded{Page loaded?}
    Loaded -->|No| Timeout[Timeout]
    Loaded -->|Yes| VerifyURL[get_url]
    VerifyURL --> CheckURL{URL correct?}
    CheckURL -->|Yes| WaitElem[wait_for_element]
    CheckURL -->|No| Error[Error]
    WaitElem --> Ready{Element ready?}
    Ready -->|Yes| Continue[Continue workflow]
    Ready -->|No| Timeout
    Timeout --> End([End with error])
    Error --> End
    Continue --> End2([Success])
```

---

## Multi-Tab/Frame Flow

```mermaid
flowchart TD
    Start([Main Page]) --> CheckType{Context Type?}

    CheckType -->|New Tab| NewTab[click element with target=_blank]
    CheckType -->|iFrame| Frame[Has iframe content]

    NewTab --> SwitchTab[switch_to_new_tab]
    SwitchTab --> WaitTab[wait_for_navigation]
    WaitTab --> WorkTab[Work in new tab]
    WorkTab --> ExtractTab[extract_text/get data]
    ExtractTab --> CloseTab{Close tab?}
    CloseTab -->|Yes| Close[close_tab]
    CloseTab -->|No| KeepTab[Keep tab open]
    Close --> BackMain1[Back to main context]
    KeepTab --> BackMain1

    Frame --> SwitchFrame[switch_to_iframe]
    SwitchFrame --> WaitFrame[wait_for_element: in iframe]
    WaitFrame --> WorkFrame[Interact with iframe content]
    WorkFrame --> ClickFrame[click/type in iframe]
    ClickFrame --> ExtractFrame[extract_text from iframe]
    ExtractFrame --> BackMain2[switch_to_main_frame]

    BackMain1 --> Continue
    BackMain2 --> Continue[Continue on main page]
    Continue --> End([End])
```

---

## Error Handling Flow

```mermaid
flowchart TD
    Start([Action Execution]) --> Try{Try Action}
    Try --> Action[Execute Browser Action]
    Action --> Success{Successful?}

    Success -->|Yes| Screenshot1[screenshot]
    Screenshot1 --> Log1[Log success]
    Log1 --> Continue([Continue])

    Success -->|No| ErrorType{Error Type?}

    ErrorType -->|Element Not Found| WaitRetry[wait_for_element]
    ErrorType -->|Timeout| WaitTime[wait_for_timeout]
    ErrorType -->|Navigation Failed| Reload[reload page]
    ErrorType -->|Other| CaptureError

    WaitRetry --> RetryAction{Retry?}
    WaitTime --> RetryAction
    Reload --> RetryAction

    RetryAction -->|Yes, attempts left| Action
    RetryAction -->|No| CaptureError[screenshot error state]

    CaptureError --> LogError[Log detailed error]
    LogError --> CheckCritical{Critical?}
    CheckCritical -->|Yes| StopFlow[Stop workflow]
    CheckCritical -->|No| SkipContinue[Skip & continue]

    StopFlow --> End([Workflow failed])
    SkipContinue --> Continue
```

---

## Complete Automation Flow

```mermaid
flowchart TD
    UserPrompt([User Natural Language Prompt]) --> Ollama[Send to Ollama LLM]
    Ollama --> ParseResponse[Parse LLM Response]
    ParseResponse --> ValidateSteps{Valid steps?}

    ValidateSteps -->|No| Fallback[Use fallback steps]
    ValidateSteps -->|Yes| Steps
    Fallback --> Steps[Array of Action Steps]

    Steps --> InitBrowser[Initialize Browser Context]
    InitBrowser --> CreatePage[Create New Page]
    CreatePage --> StartLoop{More steps?}

    StartLoop -->|Yes| GetStep[Get next step]
    StartLoop -->|No| Cleanup

    GetStep --> Delay[Add random delay]
    Delay --> LogStep[Log step execution]
    LogStep --> ExecuteStep[Execute action]

    ExecuteStep --> ActionType{Action Type?}

    ActionType -->|Navigate| DoNavigate[navigate to URL]
    ActionType -->|Interact| DoInteract[click/type/hover]
    ActionType -->|Extract| DoExtract[extract data]
    ActionType -->|Wait| DoWait[wait for condition]
    ActionType -->|Scroll| DoScroll[scroll page]
    ActionType -->|Screenshot| DoScreen[take screenshot]
    ActionType -->|Cookie| DoCookie[manage cookies]
    ActionType -->|Alert| DoAlert[handle alert]
    ActionType -->|File| DoFile[upload/download]
    ActionType -->|Frame| DoFrame[switch context]
    ActionType -->|Advanced| DoAdvanced[execute JavaScript]

    DoNavigate --> StepComplete
    DoInteract --> StepComplete
    DoExtract --> StepComplete
    DoWait --> StepComplete
    DoScroll --> StepComplete
    DoScreen --> StepComplete
    DoCookie --> StepComplete
    DoAlert --> StepComplete
    DoFile --> StepComplete
    DoFrame --> StepComplete
    DoAdvanced --> StepComplete

    StepComplete[Step completed] --> CaptureResult[Capture result]
    CaptureResult --> LogMetrics[Update metrics]
    LogMetrics --> CheckError{Error occurred?}

    CheckError -->|Yes| HandleError[Log error details]
    CheckError -->|No| NextStep
    HandleError --> ErrorScreen[Take error screenshot]
    ErrorScreen --> NextStep{Continue?}

    NextStep -->|Yes| StartLoop
    NextStep -->|No| Cleanup

    Cleanup[Close browser context] --> FinalScreen[Take final screenshot]
    FinalScreen --> SaveVideo[Save video recording]
    SaveVideo --> BuildResponse[Build JSON response]
    BuildResponse --> ReturnResults[Return to user]
    ReturnResults --> End([End])
```

---

## Detailed Action Flow: Form Filling

```mermaid
flowchart LR
    subgraph "Preparation"
        A1[navigate to form] --> A2[wait_for_element: form]
        A2 --> A3[get_title: verify page]
    end

    subgraph "Field 1: Email"
        B1[focus: email field] --> B2[clear_input: email]
        B2 --> B3[type: email value]
        B3 --> B4{Validate?}
        B4 -->|Yes| B5[extract_text: error]
        B4 -->|No| B6[Next]
        B5 --> B6
    end

    subgraph "Field 2: Password"
        C1[focus: password] --> C2[type: password]
        C2 --> C3[press_key: Tab]
    end

    subgraph "Options"
        D1[check_checkbox: terms] --> D2[select_dropdown: country]
        D2 --> D3[upload_file: document]
    end

    subgraph "Submission"
        E1[screenshot: before submit] --> E2[click: submit]
        E2 --> E3[wait_for_navigation]
        E3 --> E4[element_exists: success]
    end

    A3 --> B1
    B6 --> C1
    C3 --> D1
    D3 --> E1
```

---

## Action Dependencies

```mermaid
graph TD
    subgraph "Actions that require waiting"
        W1[click] -.->|should wait after| W2[wait_for_navigation]
        W3[type Enter] -.->|should wait after| W2
        W4[navigate] -.->|should wait after| W2
        W5[Any action] -.->|should wait before| W6[wait_for_element]
    end

    subgraph "Actions requiring element presence"
        E1[click] --> E2[Element must exist]
        E3[type] --> E2
        E4[hover] --> E2
        E5[extract_text] --> E2
        E6[get_attribute] --> E2
        E7[scroll_to] --> E2
    end

    subgraph "Actions requiring visibility"
        V1[click] --> V2[Element must be visible]
        V3[hover] --> V2
        V4[drag_and_drop] --> V2
    end

    subgraph "Context-dependent actions"
        C1[switch_to_iframe] --> C2[Changes context]
        C2 --> C3[Subsequent actions work in iframe]
        C3 --> C4[switch_to_main_frame]
        C4 --> C5[Back to main context]
    end
```

---

## Screenshot Decision Flow

```mermaid
flowchart TD
    Action([Action Completed]) --> ShouldCapture{Need screenshot?}

    ShouldCapture -->|Visual change| FullPage[screenshot: full page]
    ShouldCapture -->|Specific element| Element[screenshot_element]
    ShouldCapture -->|Error occurred| ErrorShot[screenshot: error state]
    ShouldCapture -->|No change| Skip[Skip screenshot]

    FullPage --> WhenFull{When to capture?}
    WhenFull -->|After navigate| Cap1[After page load]
    WhenFull -->|After click| Cap2[After interaction]
    WhenFull -->|After scroll| Cap3[After scroll]
    WhenFull -->|Manual| Cap4[On demand]

    Element --> WhenElem{When to capture?}
    WhenElem -->|After modification| Cap5[After element change]
    WhenElem -->|Before action| Cap6[Before interaction]
    WhenElem -->|Error state| Cap7[Error element]

    Cap1 --> Save[Save screenshot]
    Cap2 --> Save
    Cap3 --> Save
    Cap4 --> Save
    Cap5 --> Save
    Cap6 --> Save
    Cap7 --> Save
    ErrorShot --> Save

    Save --> Encode[Base64 encode]
    Encode --> Return[Return in results]
    Skip --> Continue[Continue workflow]
    Return --> Continue
```

---

## Cookie Management Flow

```mermaid
flowchart TD
    Start([Page Loaded]) --> CookieAction{Cookie Action?}

    CookieAction -->|Get| GetAll[get_cookies]
    CookieAction -->|Set| SetNew[set_cookie: JSON]
    CookieAction -->|Clear| ClearAll[clear_cookies]
    CookieAction -->|Banner| HandleBanner

    GetAll --> StoreData[Store cookie data]
    StoreData --> UseData{Use cookies?}
    UseData -->|Yes| ProcessCookies[Process cookie values]
    UseData -->|No| Continue1

    SetNew --> ValidateCookie{Valid format?}
    ValidateCookie -->|Yes| ApplyCookie[Add to context]
    ValidateCookie -->|No| Error[Cookie error]
    ApplyCookie --> ReloadMaybe{Need reload?}
    ReloadMaybe -->|Yes| Reload[reload page]
    ReloadMaybe -->|No| Continue1

    ClearAll --> RemoveAll[Remove all cookies]
    RemoveAll --> ReloadPage[reload page]

    HandleBanner[Cookie banner detected] --> BannerChoice{User choice?}
    BannerChoice -->|Accept| ClickAccept[click: accept all]
    BannerChoice -->|Reject| ClickReject[click: reject all]
    BannerChoice -->|Custom| ClickCustom[click: customize]

    ClickAccept --> WaitBanner[wait for banner to close]
    ClickReject --> WaitBanner
    ClickCustom --> ConfigureOptions[Set preferences]
    ConfigureOptions --> WaitBanner

    WaitBanner --> VerifyGone{Banner gone?}
    VerifyGone -->|Yes| Continue1
    VerifyGone -->|No| ForceClose[Force close banner]

    ProcessCookies --> Continue1
    Reload --> Continue1
    ReloadPage --> Continue1
    ForceClose --> Continue1
    Error --> Continue1
    Continue1[Continue workflow] --> End([End])
```

---

## Alert/Dialog Handling Flow

```mermaid
flowchart TD
    Action[Action triggered] --> CheckAlert{Alert expected?}

    CheckAlert -->|Yes| PrepareHandler[Set alert handler BEFORE action]
    CheckAlert -->|No| Execute

    PrepareHandler --> HandlerType{Handler type?}
    HandlerType -->|Accept| SetAccept[accept_alert]
    HandlerType -->|Dismiss| SetDismiss[dismiss_alert]
    HandlerType -->|Get text| SetGetText[get_alert_text]

    SetAccept --> Execute[Execute triggering action]
    SetDismiss --> Execute
    SetGetText --> Execute

    Execute --> AlertAppears{Alert appears?}
    AlertAppears -->|Yes| HandleAlert[Handler executes automatically]
    AlertAppears -->|No| NoAlert[Continue normally]

    HandleAlert --> AlertType{What happened?}
    AlertType -->|Accepted| AlertAccepted[Alert accepted]
    AlertType -->|Dismissed| AlertDismissed[Alert dismissed]
    AlertType -->|Text extracted| TextExtracted[Text saved to results]

    AlertAccepted --> AfterAlert
    AlertDismissed --> AfterAlert
    TextExtracted --> AfterAlert

    AfterAlert[Continue after alert] --> Screenshot[screenshot]
    NoAlert --> Continue2
    Screenshot --> Continue2[Continue workflow]
    Continue2 --> End([End])
```

---

## Data Validation Pattern

```mermaid
flowchart TD
    Input([Input Action]) --> ExtractValue[extract_text/get_attribute]
    ExtractValue --> CheckExists{element_exists?}

    CheckExists -->|No| NoData[No data found]
    CheckExists -->|Yes| CheckVisible{is_visible?}

    CheckVisible -->|No| NotVisible[Element not visible]
    CheckVisible -->|Yes| GetData[Get data value]

    GetData --> ValidateData{Validate data?}
    ValidateData -->|Length| CheckLength{Length OK?}
    ValidateData -->|Format| CheckFormat{Format OK?}
    ValidateData -->|Range| CheckRange{In range?}
    ValidateData -->|Presence| CheckPresence{Not empty?}

    CheckLength -->|No| Invalid
    CheckLength -->|Yes| Valid
    CheckFormat -->|No| Invalid
    CheckFormat -->|Yes| Valid
    CheckRange -->|No| Invalid
    CheckRange -->|Yes| Valid
    CheckPresence -->|No| Invalid
    CheckPresence -->|Yes| Valid

    NoData --> TakeScreenshot
    NotVisible --> TakeScreenshot
    Invalid[Validation failed] --> TakeScreenshot[screenshot: error state]
    TakeScreenshot --> LogError[Log validation error]
    LogError --> RetryOrFail{Retry?}
    RetryOrFail -->|Yes| Input
    RetryOrFail -->|No| End1([Failed])

    Valid[Validation passed] --> StoreData[Store validated data]
    StoreData --> Continue[Continue workflow]
    Continue --> End2([Success])
```

---

## Legend

### Node Types

- **Rectangle**: Action or process
- **Diamond**: Decision point
- **Rounded Rectangle**: Start/End point
- **Parallelogram**: Input/Output
- **Hexagon**: Preparation step

### Arrow Types

- **Solid arrow** (→): Primary flow
- **Dotted arrow** (⋯>): Dependency or recommendation
- **Thick arrow** (⟹): Important path

### Color Coding (when rendered)

- **Blue**: Actions
- **Green**: Success paths
- **Red**: Error paths
- **Yellow**: Decision points

---

## How to Use These Flowcharts

1. **Planning**: Use flowcharts to plan automation sequences
2. **Debugging**: Follow flowcharts to identify where workflow failed
3. **Documentation**: Reference when documenting automation processes
4. **Training**: Teach team members about automation patterns
5. **Optimization**: Identify redundant steps or bottlenecks

---

**Version:** 1.0
**Last Updated:** January 2025
**Format:** Mermaid Flowcharts (render in GitHub, VS Code, or Mermaid viewers)
