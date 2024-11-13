import Author from "../models/author";
import * as authorFunctions from "../pages/authors";
import { getAuthorList, showAllAuthors } from "../pages/authors";
import { Response } from "express";

describe("Functions in authors.ts", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("getAuthorList", () => {
    it("should fetch and format the authors list correctly", async () => {
      const sortedAuthors = [
        {
          first_name: "Jane",
          family_name: "Austen",
          date_of_birth: new Date("1775-12-16"),
          date_of_death: new Date("1817-07-18"),
        },
        {
          first_name: "Amitav",
          family_name: "Ghosh",
          date_of_birth: new Date("1835-11-30"),
          date_of_death: new Date("1910-04-21"),
        },
        {
          first_name: "Rabindranath",
          family_name: "Tagore",
          date_of_birth: new Date("1812-02-07"),
          date_of_death: new Date("1870-06-09"),
        },
      ];

      // Mock the find method to chain with sort
      const mockFind = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue(sortedAuthors),
      });

      // Apply the mock directly to the Author model's `find` function
      Author.find = mockFind;

      // Act: Call the function to get the authors list
      const result = await getAuthorList();

      // Assert: Check if the result matches the expected sorted output
      const expectedAuthors = [
        "Austen, Jane : 1775 - 1817",
        "Ghosh, Amitav : 1835 - 1910",
        "Tagore, Rabindranath : 1812 - 1870",
      ];
      expect(result).toEqual(expectedAuthors);

      expect(mockFind().sort).toHaveBeenCalledWith([
        ["family_name", "ascending"],
      ]);
    });

    it("should format fullname as empty string if first name is absent", async () => {
      const sortedAuthors = [
        {
          first_name: "",
          family_name: "Austen",
          date_of_birth: new Date("1775-12-16"),
          date_of_death: new Date("1817-07-18"),
        },
        {
          first_name: "Amitav",
          family_name: "Ghosh",
          date_of_birth: new Date("1835-11-30"),
          date_of_death: new Date("1910-04-21"),
        },
        {
          first_name: "Rabindranath",
          family_name: "Tagore",
          date_of_birth: new Date("1812-02-07"),
          date_of_death: new Date("1870-06-09"),
        },
      ];

      // Mock the find method to chain with sort
      const mockFind = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue(sortedAuthors),
      });

      // Apply the mock directly to the Author model's `find` function
      Author.find = mockFind;

      // Act: Call the function to get the authors list
      const result = await getAuthorList();

      // Assert: Check if the result matches the expected sorted output
      const expectedAuthors = [
        " : 1775 - 1817",
        "Ghosh, Amitav : 1835 - 1910",
        "Tagore, Rabindranath : 1812 - 1870",
      ];
      expect(result).toEqual(expectedAuthors);

      expect(mockFind().sort).toHaveBeenCalledWith([
        ["family_name", "ascending"],
      ]);
    });

    it("should return an empty array when an error occurs", async () => {
      Author.find = jest.fn().mockImplementation(() => {
        throw new Error("Database error");
      });

      // Act: Call the function to get the authors list
      const result = await getAuthorList();

      // Assert: Verify the result is an empty array
      expect(result).toEqual([]);
    });
  });

  describe("showAllAuthors", () => {
    let mockResponse: Response;

    beforeEach(() => {
      mockResponse = {
        send: jest.fn(),
      } as unknown as Response;
    });

    it("should send the list of authors as response if data is available", async () => {
      const authorsList = [
        "Austen, Jane : 1775 - 1817",
        "Ghosh, Amitav : 1835 - 1910",
        "Tagore, Rabindranath : 1812 - 1870",
      ];

      jest
        .spyOn(authorFunctions, "getAuthorList")
        .mockResolvedValue(authorsList);

      await showAllAuthors(mockResponse);

      expect(mockResponse.send).toHaveBeenCalledWith(authorsList);
    });

    it('should send "No authors found" as response if the data array does not have any values', async () => {
      jest.spyOn(authorFunctions, "getAuthorList").mockResolvedValue([]);

      await showAllAuthors(mockResponse);

      expect(mockResponse.send).toHaveBeenCalledWith("No authors found");
    });

    it('should send "No authors found" as response if an any error occurs', async () => {
      jest
        .spyOn(authorFunctions, "getAuthorList")
        .mockRejectedValue(new Error("Error"));

      await showAllAuthors(mockResponse);

      expect(mockResponse.send).toHaveBeenCalledWith("No authors found");
    });
  });
});
