if __name__ == '__main__':
    
    def factorial(num):
        if num==0:
            return 1
            pass
        
        return factorial(num-1)*num
        pass
    
    res = factorial(5)
    print(res, end="")
    
    pass

