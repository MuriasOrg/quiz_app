const request = require('supertest');
import app from '../src/app';
import { generateQuestions } from '../src/services/question-generator';
import { generateQuestionsController } from '../src/controllers/question-controller';


describe("Question Service - Health", () => {

    it("should return 200 if / is accessed", async () => {
        const response = await request(app).get('/');
        expectOperative(response);
    })

    it("should return / if any url is accessed", async () => {
        const response = await request(app).get('/testTest');
        expectOperative(response);
    })

})

describe("Question Service - Erroneous parameters for /questions", () => {

    it("should return 400 if accessed without parameter", async () => {
        const response = await request(app).get('/questions')
        expectError(response)
    })

    it("should return 400 if accessed with erroneous parameter", async () => {
        const response = await request(app).get('/questions?errorTest')
        expectError(response)
    })

    it("should return 400 if accessed with size parameter but is not provided", async () => {

        const response = await request(app).get('/questions?size')
        expectError(response)
    })

    it("should return 400 if accessed with size parameter but value type is wrong", async () => {
        const response = await request(app).get('/questions?size=wrongValue')
        expectError(response)

    })

    it("should return 400 if accessed with only lang parameter", async () => {
        const response = await request(app).get('/questions?lang=en')
        expectError(response)

    })

    it("should return 400 if accessed with size parameter and not supported language", async () => {
        const response = await request(app).get('/questions?size=5&lang=nonsupported')
        expectError(response)
    })

    it("should return 400 if the size is too big", async () => {

        const response = await request(app).get('/questions?size=101')
        expectError(response)

    })

    it("should return 400 if the size is negative", async () => {
        const response = await request(app).get('/questions?size=-1')
        expectError(response)
    })

})

function expectOperative(response: any) {
    expect(response.status).toBe(200)
    expect(response.body.data).toHaveProperty("health", "Operative")
}

function expectError(response: any) {
    expect(response.status).toBe(400)
    expect(response.body.data).toHaveProperty("error")
}

// Mocking the question-generator.ts to test question-controller
// Done to avoid flakiness by calling DB or API
jest.mock('../src/services/question-generator')

describe("Question Service - Question Generation", () => {

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should return questions when controller succeeds", async () => {

        // Mocking the response of generateQuestions(size) => Questions
        const mockResponse = ['Question 1', 'Question 2', 'Question 3'];
        (generateQuestions as jest.Mock).mockResolvedValue(mockResponse)

        // Mock req and res for controller
        const req = { query: { size: mockResponse.length, lang: "en" } } as any
        const res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis()
        } as any

        await generateQuestionsController(req, res)

        // Ensuring mock fn was called like => await generateQuestions(3)
        expect(generateQuestions).toHaveBeenCalledWith(mockResponse.length, "en");
        // Ensuring mock fn was called like => res.json(['Question1', 'Question2', 'Question3'])
        expect(res.json).toHaveBeenCalledWith(mockResponse)

    })

    it("should return an error 500 when controller fails", async () => {

        // Mocking the response of generateQuestions(size) => Error!
        const mockError = new Error("Mock!! A fail");
        (generateQuestions as jest.Mock).mockRejectedValue(mockError)

        // Mock req and res for controller
        const req = { query: { size: 3, lang: "en" } } as any
        const res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis()
        } as any

        await generateQuestionsController(req, res)

        // Ensuring mock fn was called like => await generateQuestions(3)
        expect(generateQuestions).toHaveBeenCalledWith(3, "en");
        // Ensuring mock fn was called like => res.status(500)
        expect(res.status).toHaveBeenCalledWith(500)
        // Ensuring mock fn was called like => res.json({status: 'fail'})
        expect(res.json).toHaveBeenLastCalledWith({
            status: 'fail',
            message: "Can't generate questions! Mock!! A fail"
        })


    })

})