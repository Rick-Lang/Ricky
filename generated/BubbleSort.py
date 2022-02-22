if __name__ == '__main__':
    def BubbleSort(arr):
        index = 0
        while index<len(arr):
            index = index+1
            index2 = 0
            while index2<len(arr)-1:
                if arr[index2]>arr[index2+1]:
                    arr[index2],arr[index2+1] = arr[index2+1],arr[index2]
                    pass
                index2 = index2+1
                pass
            pass
        print(arr, end="")
        pass
    
    
    arr = [6,7,5,9,12]
    BubbleSort(arr)
    pass

